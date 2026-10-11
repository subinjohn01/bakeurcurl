/**
 * BakeUrCurl — Payment Controller (Stripe)
 *
 * Functions:
 *   createPaymentIntent   POST  /api/payments/create-intent     (public/auth)
 *   webhookHandler        POST  /api/payments/webhook           (Stripe webhook)
 *   getPaymentStatus      GET   /api/payments/status/:bookingId (auth)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../utils/emailService');

// ─── createPaymentIntent ──────────────────────────────────────────────────────
/**
 * @desc    Create a Stripe PaymentIntent for the 30% advance payment of a booking
 * @route   POST /api/payments/create-intent
 * @access  Public / Private (both guests and authenticated customers)
 *
 * Body: { bookingId: string }
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required.' });
    }

    // Fetch booking
    const booking = await Booking.findOne({
      $or: [{ _id: bookingId }, { bookingId }],
    })
      .populate('service', 'name price')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.paymentStatus !== 'unpaid') {
      return res.status(400).json({
        success: false,
        message: `Booking has already been paid (status: ${booking.paymentStatus}).`,
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled booking.',
      });
    }

    // Amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(booking.advanceAmount * 100);

    const customerName = booking.customer
      ? booking.customer.name
      : booking.guestInfo?.name;
    const customerEmail = booking.customer
      ? booking.customer.email
      : booking.guestInfo?.email;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: booking.bookingId,
        internalId: booking._id.toString(),
        serviceName: booking.service?.name || '',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
      },
      description: `BakeUrCurl Advance Payment — Booking ${booking.bookingId} (${booking.service?.name})`,
      receipt_email: customerEmail || undefined,
    });

    // Store PaymentIntent ID on the booking
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.advanceAmount,
      currency: 'usd',
      booking: {
        bookingId: booking.bookingId,
        serviceName: booking.service?.name,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
      },
    });
  } catch (err) {
    // Handle Stripe-specific errors
    if (err.type && err.type.startsWith('Stripe')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─── webhookHandler ───────────────────────────────────────────────────────────
/**
 * @desc    Handle Stripe webhook events to update booking payment status
 * @route   POST /api/payments/webhook
 * @access  Stripe only (raw body required — registered before JSON parser in server.js)
 */
const webhookHandler = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Handle supported events
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const internalBookingId = paymentIntent.metadata?.internalId;

      if (internalBookingId) {
        try {
          const booking = await Booking.findByIdAndUpdate(
            internalBookingId,
            {
              $set: {
                paymentStatus: 'advance_paid',
                status: 'confirmed', // Auto-confirm on payment
              },
            },
            { new: true }
          )
            .populate('customer', 'name email')
            .populate('service', 'name price duration')
            .populate('staff', 'name');

          if (booking) {
            console.log(`✅ Payment succeeded for booking ${booking.bookingId}`);
            // Send confirmation email (non-blocking)
            const email = booking.customer?.email || booking.guestInfo?.email;
            const name = booking.customer?.name || booking.guestInfo?.name;
            if (email) {
              sendBookingConfirmation(email, name, booking).catch((e) =>
                console.error('Confirmation email failed:', e.message)
              );
            }
          }
        } catch (dbErr) {
          console.error('DB update after payment_intent.succeeded failed:', dbErr.message);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.warn(`⚠️  Payment failed for PaymentIntent ${paymentIntent.id}`);
      // Optionally notify customer or update booking status here
      break;
    }

    case 'payment_intent.canceled': {
      const paymentIntent = event.data.object;
      console.log(`ℹ️  PaymentIntent ${paymentIntent.id} was cancelled.`);
      break;
    }

    default:
      // Unhandled event type — log but acknowledge
      console.log(`ℹ️  Unhandled Stripe event type: ${event.type}`);
  }

  // Acknowledge receipt to Stripe
  res.status(200).json({ received: true });
};

// ─── getPaymentStatus ─────────────────────────────────────────────────────────
/**
 * @desc    Get payment status for a booking
 * @route   GET /api/payments/status/:bookingId
 * @access  Private
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      $or: [{ bookingId }, { _id: bookingId.length === 24 ? bookingId : null }],
    }).select('bookingId totalAmount advanceAmount paymentStatus paymentIntentId status');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Access control: customers can only check their own bookings
    if (req.user.role === 'customer') {
      const fullBooking = await Booking.findById(booking._id);
      if (
        fullBooking.customer &&
        fullBooking.customer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.status(200).json({
      success: true,
      bookingId: booking.bookingId,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      totalAmount: booking.totalAmount,
      advanceAmount: booking.advanceAmount,
      remainingAmount: parseFloat((booking.totalAmount - booking.advanceAmount).toFixed(2)),
      paymentIntentId: booking.paymentIntentId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentIntent, webhookHandler, getPaymentStatus };
