/**
 * BakeUrCurl — Coupon / Loyalty Controller
 *
 * Admin actions:
 *  - createCoupon: create a loyalty coupon and assign to a customer
 *  - getAllCoupons: view all coupons with redemption status, validity & assigned customer
 *  - deleteCoupon: remove or revoke a coupon
 *
 * Customer actions:
 *  - getMyCoupons: list coupons assigned to the logged-in user
 *  - validateCoupon: check coupon validity and calculate discount for a booking
 */

const Coupon = require('../models/Coupon');
const User = require('../models/User');

// ─── createCoupon (Admin) ─────────────────────────────────────────────────────
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      title,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      customerId,
      customerEmail,
      minBookingAmount,
    } = req.body;

    if (!code || !title || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Code, title, discount type, value, and expiration date are required.',
      });
    }

    if (!['fixed', 'percentage'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Discount type must be either 'fixed' or 'percentage'.",
      });
    }

    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 1% and 100%.',
      });
    }

    // Find assigned customer by ID or Email
    let customer;
    if (customerId) {
      customer = await User.findById(customerId);
    } else if (customerEmail) {
      customer = await User.findOne({ email: customerEmail.trim().toLowerCase() });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found. Please provide a registered customer ID or valid email address.`,
      });
    }

    // Check code uniqueness
    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${normalizedCode}' already exists. Please choose a different code.`,
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      title: title.trim(),
      discountType,
      discountValue: Number(discountValue),
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: new Date(validUntil),
      customer: customer._id,
      assignedEmail: customer.email,
      minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
      createdBy: req.user._id,
    });

    const populated = await Coupon.findById(coupon._id).populate('customer', 'name email phone');

    res.status(201).json({
      success: true,
      message: `Loyalty coupon '${normalizedCode}' issued to ${customer.name}!`,
      coupon: populated,
    });
  } catch (err) {
    next(err);
  }
};

// ─── getAllCoupons (Admin) ────────────────────────────────────────────────────
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .populate('customer', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (err) {
    next(err);
  }
};

// ─── deleteCoupon (Admin) ─────────────────────────────────────────────────────
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── getMyCoupons (Customer / Protected) ──────────────────────────────────────
const getMyCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      customer: req.user._id,
      isRedeemed: false,
      validUntil: { $gte: new Date() },
    }).sort({ validUntil: 1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (err) {
    next(err);
  }
};

// ─── validateCoupon (Customer or Guest with email) ────────────────────────────
const validateCoupon = async (req, res, next) => {
  try {
    const { code, bookingAmount, customerEmail } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode }).populate('customer', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code.',
      });
    }

    // Verify ownership: customer must match
    const userEmail = req.user?.email || customerEmail?.trim().toLowerCase();
    if (!userEmail || userEmail.toLowerCase() !== coupon.assignedEmail.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `This coupon was exclusively issued to another customer (${coupon.assignedEmail}).`,
      });
    }

    // Check if already redeemed
    if (coupon.isRedeemed) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has already been redeemed.',
      });
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return res.status(400).json({
        success: false,
        message: `This coupon is not active yet. Valid from ${new Date(coupon.validFrom).toLocaleDateString()}.`,
      });
    }

    if (now > new Date(coupon.validUntil)) {
      return res.status(400).json({
        success: false,
        message: `This coupon expired on ${new Date(coupon.validUntil).toLocaleDateString()}.`,
      });
    }

    // Check minimum booking amount if set
    const amount = Number(bookingAmount) || 0;
    if (coupon.minBookingAmount > 0 && amount < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum service spend of ₹${coupon.minBookingAmount} required to use this coupon.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, amount);
    } else if (coupon.discountType === 'percentage') {
      discount = parseFloat(((amount * coupon.discountValue) / 100).toFixed(2));
    }
    const finalAmount = Math.max(0, amount - discount);

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You save ₹${discount}.`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        originalAmount: amount,
        finalAmount,
        validUntil: coupon.validUntil,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getCustomers (Admin) ───────────────────────────────────────────────────
const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email phone')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  getMyCoupons,
  validateCoupon,
  getCustomers,
};
