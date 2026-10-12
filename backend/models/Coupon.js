/**
 * BakeUrCurl — Coupon / Loyalty Model
 *
 * Configurable in 2 ways:
 *  - discountType: 'fixed' (e.g. ₹500 off) or 'percentage' (e.g. 20% off)
 *  - discountValue: Number
 *
 * Configurable validity:
 *  - validFrom: Date
 *  - validUntil: Date (configurable expiry date)
 *
 * User targeting (issued to customer by admin):
 *  - customer: Ref User (required — only assigned customer can redeem)
 *  - assignedEmail: String (customer's email for quick lookup)
 *  - isRedeemed: Boolean (tracks whether coupon was used)
 *  - redeemedAt: Date
 *  - minBookingAmount: Number (optional minimum spend)
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Coupon title or description is required.'],
      trim: true,
    },
    discountType: {
      type: String,
      enum: {
        values: ['fixed', 'percentage'],
        message: "Discount type must be either 'fixed' or 'percentage'.",
      },
      required: true,
      default: 'fixed',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required.'],
      min: [1, 'Discount value must be greater than zero.'],
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, 'Coupon validity expiration date is required.'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    assignedPhone: {
      type: String,
      trim: true,
      default: '',
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, assignedEmail: 1 });
couponSchema.index({ code: 1, assignedPhone: 1 });
couponSchema.index({ customer: 1, isRedeemed: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
