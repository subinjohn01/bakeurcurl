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

// Helper: normalize last 10 digits of phone
const cleanPhone = (p) => (p ? String(p).replace(/\D/g, '').slice(-10) : '');

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
      customerPhone,
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

    const trimmedPhone = customerPhone ? customerPhone.trim() : '';
    const trimmedEmail = customerEmail ? customerEmail.trim().toLowerCase() : '';
    const phoneDigits = cleanPhone(trimmedPhone);

    if (!customerId && !trimmedPhone && !trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a target customer mobile number, email, or select a customer.',
      });
    }

    // Find assigned customer by ID, Phone, or Email
    let customer = null;
    if (customerId) {
      customer = await User.findById(customerId);
    } else if (phoneDigits) {
      customer = await User.findOne({
        phone: { $regex: phoneDigits + '$' },
      });
    } else if (trimmedEmail) {
      customer = await User.findOne({ email: trimmedEmail });
    }

    // Determine assignedEmail and assignedPhone
    const assignedPhone = customer?.phone || trimmedPhone;
    const assignedEmail = customer?.email || trimmedEmail;

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
      customer: customer ? customer._id : null,
      assignedEmail,
      assignedPhone,
      minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
      createdBy: req.user._id,
    });

    const populated = await Coupon.findById(coupon._id).populate('customer', 'name email phone');

    const recipientLabel = customer?.name || assignedPhone || assignedEmail;

    res.status(201).json({
      success: true,
      message: `Loyalty coupon '${normalizedCode}' issued to ${recipientLabel}!`,
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

// ─── validateCoupon (Customer or Guest with email/phone) ─────────────────────
const validateCoupon = async (req, res, next) => {
  try {
    const { code, bookingAmount, customerEmail, customerPhone } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode }).populate('customer', 'name email phone');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code.',
      });
    }

    // Verify ownership: customer must match by phone OR email
    const userEmail = req.user?.email || customerEmail?.trim().toLowerCase();
    const userPhone = req.user?.phone || customerPhone?.trim();

    const cleanUserPhone = cleanPhone(userPhone);
    const cleanAssignedPhone = cleanPhone(coupon.assignedPhone || coupon.customer?.phone);

    const phoneMatches = Boolean(
      cleanAssignedPhone && cleanUserPhone && cleanAssignedPhone === cleanUserPhone
    );
    const emailMatches = Boolean(
      coupon.assignedEmail &&
        userEmail &&
        coupon.assignedEmail.toLowerCase() === userEmail.toLowerCase()
    );

    if (!phoneMatches && !emailMatches) {
      const targetLabel = coupon.assignedPhone || coupon.assignedEmail || 'another customer';
      return res.status(403).json({
        success: false,
        message: `This coupon was exclusively issued to another customer (${targetLabel}).`,
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
