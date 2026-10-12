/**
 * BakeUrCurl — Booking Controller
 *
 * Functions:
 *   createBooking        POST  /api/bookings             (public/auth)
 *   getBookings          GET   /api/bookings             (admin/staff = all, customer = own)
 *   getBookingById       GET   /api/bookings/:id
 *   updateBookingStatus  PATCH /api/bookings/:id/status  (staff/admin)
 *   cancelBooking        PATCH /api/bookings/:id/cancel  (customer own, or admin)
 *   getAvailableSlots    GET   /api/bookings/available-slots (public)
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendAppointmentReminder,
} = require('../utils/emailService');
const {
  sendAppointmentReminderWhatsApp,
  sendBookingConfirmationWhatsApp,
} = require('../utils/whatsappService');

// ─── Business Logic Constants ─────────────────────────────────────────────────

// All possible 30-minute slots in a working day (09:00 – 18:30)
const ALL_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM',
];

// ─── createBooking ────────────────────────────────────────────────────────────
/**
 * @desc    Create a new appointment booking
 * @route   POST /api/bookings
 * @access  Public (guests) / Private (authenticated customers)
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      staffId,
      date,
      timeSlot,
      notes,
      couponCode,
      customerInfo,
      customerId,
      status,
      paymentStatus,
      totalAmount: customTotal,
      advanceAmount: customAdvance,
      // Guest fields (used when not authenticated)
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    const gName = guestName || customerInfo?.name;
    const gEmail = guestEmail || customerInfo?.email || '';
    const gPhone = guestPhone || customerInfo?.phone || '';
    const bookingNotes = notes || customerInfo?.notes || '';

    // Validate or find service
    let service = null;
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
      service = await Service.findById(serviceId);
    }
    if (!service) {
      service = await Service.findOne({ isActive: true });
    }
    if (!service) {
      service = await Service.create({
        name: 'Haircut & Styling',
        description: 'Standard Salon Service',
        price: 999,
        duration: 60,
        category: 'haircut',
        isActive: true,
      });
    }

    // Validate or find staff
    let staff = null;
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      staff = await User.findOne({ _id: staffId, role: 'staff', isActive: true });
    }
    if (!staff) {
      staff = (await User.findOne({ role: 'staff', isActive: true })) || (await User.findOne({ role: 'admin' }));
    }
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found or unavailable.' });
    }

    // Check for slot conflict (same staff, same date, same time)
    const bookingDate = date ? new Date(date) : new Date();
    bookingDate.setHours(0, 0, 0, 0);
    const resolvedSlot = timeSlot || '10:00 AM';

    const isAdminOrStaff = req.user && (req.user.role === 'admin' || req.user.role === 'staff');
    if (!isAdminOrStaff) {
      const nextDay = new Date(bookingDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const conflict = await Booking.findOne({
        staff: staff._id,
        date: { $gte: bookingDate, $lt: nextDay },
        timeSlot: resolvedSlot,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is already booked for the selected staff member.',
        });
      }
    }

    // Determine total and advance payment amounts with optional coupon
    const originalAmount = customTotal !== undefined ? Number(customTotal) : service.price;
    let totalAmount = originalAmount;
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const userEmail = (req.user && req.user.role === 'customer') ? req.user.email : gEmail;
      const userPhone = (req.user && req.user.role === 'customer') ? req.user.phone : gPhone;

      const cleanUserPhone = userPhone ? String(userPhone).replace(/\D/g, '').slice(-10) : '';

      const foundCoupon = await Coupon.findOne({
        code: normalizedCode,
        isRedeemed: false,
        validUntil: { $gte: new Date() },
      });

      if (foundCoupon) {
        const cleanCouponPhone = foundCoupon.assignedPhone
          ? String(foundCoupon.assignedPhone).replace(/\D/g, '').slice(-10)
          : '';

        const phoneMatches = Boolean(
          cleanCouponPhone && cleanUserPhone && cleanCouponPhone === cleanUserPhone
        );
        const emailMatches = Boolean(
          foundCoupon.assignedEmail &&
            userEmail &&
            foundCoupon.assignedEmail.toLowerCase() === String(userEmail).toLowerCase()
        );

        if (phoneMatches || emailMatches) {
          if (!foundCoupon.minBookingAmount || originalAmount >= foundCoupon.minBookingAmount) {
            if (foundCoupon.discountType === 'fixed') {
              discountAmount = Math.min(foundCoupon.discountValue, originalAmount);
            } else if (foundCoupon.discountType === 'percentage') {
              discountAmount = parseFloat(((originalAmount * foundCoupon.discountValue) / 100).toFixed(2));
            }
            totalAmount = Math.max(0, originalAmount - discountAmount);
            appliedCoupon = foundCoupon;
          }
        }
      }
    }

    const advanceAmount = customAdvance !== undefined
      ? Number(customAdvance)
      : parseFloat((totalAmount * 0.3).toFixed(2));

    // Build booking document
    const bookingData = {
      service: service._id,
      staff: staff._id,
      date: bookingDate,
      timeSlot: resolvedSlot,
      originalAmount,
      totalAmount,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      advanceAmount,
      notes: bookingNotes,
      status: status || (isAdminOrStaff ? 'confirmed' : 'pending'),
      paymentStatus: paymentStatus || 'unpaid',
    };

    if (isAdminOrStaff && customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      bookingData.customer = customerId;
    } else if (req.user && req.user.role === 'customer') {
      bookingData.customer = req.user._id;
    } else {
      bookingData.guestInfo = {
        name: gName || 'Customer',
        email: gEmail || '',
        phone: gPhone || '',
      };
    }

    const booking = await Booking.create(bookingData);

    // If a coupon was applied, mark it as redeemed
    if (appliedCoupon) {
      appliedCoupon.isRedeemed = true;
      appliedCoupon.redeemedAt = new Date();
      await appliedCoupon.save();
    }

    // Populate for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'name price duration')
      .populate('staff', 'name email');

    // Send confirmation email (non-blocking)
    try {
      const recipientEmail = req.user ? req.user.email : gEmail;
      const recipientName = req.user ? req.user.name : gName;
      await sendBookingConfirmation(recipientEmail, recipientName, populatedBooking);
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr.message);
    }

    // Send WhatsApp confirmation (non-blocking)
    try {
      const recipientPhone = req.user ? req.user.phone : gPhone;
      const recipientName = req.user ? req.user.name : gName;
      if (recipientPhone) {
        await sendBookingConfirmationWhatsApp({
          phone: recipientPhone,
          name: recipientName,
          serviceName: populatedBooking.service?.name,
          date: new Date(populatedBooking.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          timeSlot: populatedBooking.timeSlot,
          stylistName: populatedBooking.staff?.name,
          bookingId: populatedBooking.bookingId,
          totalAmount: populatedBooking.totalAmount,
        });
      }
    } catch (waErr) {
      console.error('WhatsApp send failed (non-fatal):', waErr.message);
    }

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (err) {
    next(err);
  }
};

// ─── getBookings ──────────────────────────────────────────────────────────────
/**
 * @desc    Get bookings — admin/staff see all, customers see their own
 * @route   GET /api/bookings
 * @access  Private
 */
const getBookings = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    // Customers only see their own bookings
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    }

    // Staff see bookings assigned to them (unless admin)
    if (req.user.role === 'staff') {
      filter.staff = req.user._id;
    }

    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customer', 'name email phone')
        .populate('service', 'name price duration category')
        .populate('staff', 'name email')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// ─── getBookingById ───────────────────────────────────────────────────────────
/**
 * @desc    Get a single booking by MongoDB _id or bookingId string
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support both MongoDB ObjectId and human-readable bookingId (CURL-xxxx-xxxx)
    const query = id.startsWith('CURL-')
      ? { bookingId: id }
      : { _id: id };

    const booking = await Booking.findOne(query)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category')
      .populate('staff', 'name email specialization');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Access control: customers can only view their own
    if (
      req.user.role === 'customer' &&
      booking.customer &&
      booking.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ─── updateBookingStatus ──────────────────────────────────────────────────────
/**
 * @desc    Update booking status (staff/admin only)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private — staff, admin
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}.`,
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('service', 'name')
      .populate('staff', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Staff can only update their own assigned bookings
    if (
      req.user.role === 'staff' &&
      booking.staff._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    booking.status = status;
    if (status === 'cancelled' && req.body.cancellationReason) {
      booking.cancellationReason = req.body.cancellationReason;
    }

    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ─── updateBooking ────────────────────────────────────────────────────────────
/**
 * @desc    Update full booking details (staff / admin)
 * @route   PUT /api/bookings/:id
 * @access  Private — staff, admin
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      serviceId,
      staffId,
      date,
      timeSlot,
      status,
      totalAmount,
      advanceAmount,
      paymentStatus,
      notes,
      guestName,
      guestEmail,
      guestPhone,
      customerName,
      customerEmail,
      customerPhone,
      customerId,
    } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
      booking.service = serviceId;
    }
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      booking.staff = staffId;
    }
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      booking.date = d;
    }
    if (timeSlot) booking.timeSlot = timeSlot;
    if (status) booking.status = status;
    if (totalAmount !== undefined && totalAmount !== '') booking.totalAmount = Number(totalAmount);
    if (advanceAmount !== undefined && advanceAmount !== '') booking.advanceAmount = Number(advanceAmount);
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (notes !== undefined) booking.notes = notes;

    const finalName = customerName || guestName;
    const finalPhone = customerPhone || guestPhone;
    const finalEmail = customerEmail || guestEmail;

    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      booking.customer = customerId;
      booking.guestInfo = undefined;
    } else if (booking.guestInfo) {
      if (finalName) booking.guestInfo.name = finalName;
      if (finalPhone !== undefined) booking.guestInfo.phone = finalPhone;
      if (finalEmail !== undefined) booking.guestInfo.email = finalEmail;
    } else if (booking.customer) {
      if (finalName || finalPhone || finalEmail) {
        const cust = await User.findById(booking.customer);
        if (cust) {
          if (finalName) cust.name = finalName;
          if (finalPhone) cust.phone = finalPhone;
          if (finalEmail) cust.email = finalEmail;
          await cust.save();
        }
      }
    } else if (finalName) {
      booking.guestInfo = {
        name: finalName,
        phone: finalPhone || '',
        email: finalEmail || '',
      };
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category')
      .populate('staff', 'name email');

    res.status(200).json({ success: true, booking: populated });
  } catch (err) {
    next(err);
  }
};

// ─── cancelBooking ────────────────────────────────────────────────────────────
/**
 * @desc    Cancel a booking (customer can cancel own, admin can cancel any)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('service', 'name')
      .populate('staff', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Access control
    if (req.user.role === 'customer') {
      if (!booking.customer || booking.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking.' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.cancellationReason || 'Cancelled by user.';
    await booking.save();

    // Send cancellation email (non-blocking)
    try {
      const recipientEmail = booking.customer
        ? booking.customer.email
        : booking.guestInfo?.email;
      const recipientName = booking.customer
        ? booking.customer.name
        : booking.guestInfo?.name;

      if (recipientEmail) {
        await sendBookingCancellation(recipientEmail, recipientName, booking);
      }
    } catch (emailErr) {
      console.error('Cancellation email failed (non-fatal):', emailErr.message);
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    next(err);
  }
};

// ─── getAvailableSlots ────────────────────────────────────────────────────────
/**
 * @desc    Get available 30-min time slots for a staff member on a given date
 * @route   GET /api/bookings/available-slots?staffId=&date=
 * @access  Public
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { staffId, date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date query parameter is required.',
      });
    }

    let staff = null;
    if (staffId) {
      staff = await User.findOne({ _id: staffId, role: 'staff', isActive: true });
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff member not found.' });
      }
    }

    // Get booked slots for this date
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const filter = {
      date: { $gte: d, $lt: nextDay },
      status: { $in: ['pending', 'confirmed'] },
    };
    if (staffId) {
      filter.staff = staffId;
    }

    const bookedSlots = await Booking.find(filter).select('timeSlot');

    const bookedSlotSet = new Set(bookedSlots.map((b) => b.timeSlot));

    // Filter out booked slots and past slots (for today)
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const availableSlots = ALL_SLOTS.filter((slot) => {
      if (bookedSlotSet.has(slot)) return false;
      // If today, filter out past slots
      if (isToday) {
        const [time, modifier] = slot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      }
      return true;
    });

    res.status(200).json({
      success: true,
      date: d.toISOString().split('T')[0],
      staff: staff ? { id: staff._id, name: staff.name } : null,
      availableSlots,
      bookedSlots: Array.from(bookedSlotSet),
    });
  } catch (err) {
    next(err);
  }
};

// ─── sendDailyReminders (Cron / Admin Trigger) ────────────────────────────────
/**
 * @desc    Trigger automated daily WhatsApp and Email reminders for today's bookings
 * @route   POST /api/bookings/send-daily-reminders
 * @access  Admin or Secret Cron Trigger (?secret=... or x-cron-secret)
 */
const sendDailyReminders = async (req, res, next) => {
  try {
    const providedSecret = req.headers['x-cron-secret'] || req.query.secret;
    const validSecret = process.env.CRON_SECRET || 'buc_cron_secret_2024';
    const isStaffOrAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'staff');

    if (!isStaffOrAdmin && providedSecret !== validSecret) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Provide valid secret key or login as an administrator or staff member.',
      });
    }

    // Target date: defaults to today (00:00:00 to 23:59:59)
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookings = await Booking.find({
      date: { $gte: targetDate, $lt: nextDay },
      status: { $in: ['confirmed', 'pending'] },
    })
      .populate('service', 'name price duration')
      .populate('staff', 'name email phone')
      .populate('customer', 'name email phone');

    const reminderResults = [];

    for (const b of bookings) {
      const name = b.customer?.name || b.guestInfo?.name || 'Customer';
      const phone = b.customer?.phone || b.guestInfo?.phone;
      const email = b.customer?.email || b.guestInfo?.email;

      let whatsappStatus = null;
      if (phone) {
        whatsappStatus = await sendAppointmentReminderWhatsApp({
          phone,
          name,
          serviceName: b.service?.name,
          timeSlot: b.timeSlot,
          stylistName: b.staff?.name,
          bookingId: b.bookingId,
        });
      }

      let emailStatus = false;
      if (email) {
        try {
          await sendAppointmentReminder(email, name, b);
          emailStatus = true;
        } catch (e) {
          console.warn(`[Reminder Email Error for ${email}]:`, e.message);
        }
      }

      reminderResults.push({
        bookingId: b.bookingId,
        customer: name,
        phone,
        email,
        whatsappSent: Boolean(whatsappStatus?.success),
        whatsappDetails: whatsappStatus,
        emailSent: emailStatus,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${bookings.length} appointment reminders for today.`,
      date: targetDate.toISOString().split('T')[0],
      count: bookings.length,
      reminders: reminderResults,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
  sendDailyReminders,
};
