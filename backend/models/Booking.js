/**
 * BakeUrCurl — Booking Model
 *
 * Supports both authenticated customers (customer ref) and walk-in guests
 * (guestInfo embedded object).
 *
 * Booking ID format: CURL-YYYY-XXXX (auto-generated)
 * Status flow: pending → confirmed → completed | cancelled
 * Payment flow: unpaid → advance_paid → fully_paid
 */

const mongoose = require('mongoose');
const generateBookingId = require('../utils/generateBookingId');

// ─── Guest Info Sub-document ──────────────────────────────────────────────────
const guestInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// ─── Main Booking Schema ──────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      // Populated in pre-validate hook below
    },

    // Either a registered user OR guest info — at least one must be present
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestInfo: {
      type: guestInfoSchema,
      default: null,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'A service must be selected.'],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A staff member must be assigned.'],
    },

    // Appointment date (stored as Date; time component is ignored — use timeSlot)
    date: {
      type: Date,
      required: [true, 'An appointment date is required.'],
    },

    // e.g. "10:00 AM", "02:30 PM"
    timeSlot: {
      type: String,
      required: [true, 'A time slot is required.'],
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        message:
          "Status must be 'pending', 'confirmed', 'completed', or 'cancelled'.",
      },
      default: 'pending',
    },

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required.'],
      min: [0, 'Amount cannot be negative.'],
    },

    // Optional coupon redemption details
    originalAmount: {
      type: Number,
      default: null,
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 30% advance payment amount
    advanceAmount: {
      type: Number,
      default: 0,
      min: [0, 'Advance amount cannot be negative.'],
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'advance_paid', 'fully_paid'],
        message:
          "Payment status must be 'unpaid', 'advance_paid', or 'fully_paid'.",
      },
      default: 'unpaid',
    },

    // Stripe PaymentIntent ID
    paymentIntentId: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters.'],
      default: '',
    },

    // Admin/staff can log a cancellation reason
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-validate hook: auto-generate bookingId ───────────────────────────────
bookingSchema.pre('validate', async function (next) {
  if (!this.bookingId) {
    this.bookingId = await generateBookingId();
  }
  next();
});

// ─── Custom validation: must have customer OR guestInfo ───────────────────────
bookingSchema.pre('validate', function (next) {
  if (!this.customer && !this.guestInfo) {
    this.invalidate(
      'customer',
      'Booking must have either a registered customer or guest information.'
    );
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ staff: 1, date: 1 });
bookingSchema.index({ date: 1, timeSlot: 1, staff: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
