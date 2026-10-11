/**
 * BakeUrCurl — Auth Controller
 *
 * Functions:
 *   register         POST /api/auth/register
 *   login            POST /api/auth/login
 *   getMe            GET  /api/auth/me
 *   updateProfile    PUT  /api/auth/profile
 *   changePassword   PUT  /api/auth/change-password
 */

const { validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build and send a token response with the user object.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  // Strip sensitive fields before sending
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

// ─── register ─────────────────────────────────────────────────────────────────
/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Validate incoming request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check for existing account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — role defaults to 'customer' (cannot self-register as admin/staff)
    const user = await User.create({ name, email, password, phone, role: 'customer' });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── login ────────────────────────────────────────────────────────────────────
/**
 * @desc    Login and receive JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Fetch user including the password field (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── getMe ────────────────────────────────────────────────────────────────────
/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by the protect middleware
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── updateProfile ────────────────────────────────────────────────────────────
/**
 * @desc    Update name, phone, avatar, bio, specialization
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    // Whitelist updatable fields (cannot change email, password, or role here)
    const allowedFields = ['name', 'phone', 'avatar', 'bio', 'specialization'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── changePassword ───────────────────────────────────────────────────────────
/**
 * @desc    Change own password (requires current password)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch with password
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook will hash the new password

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── forgotPasswordOtp ─────────────────────────────────────────────────────────
/**
 * @desc    Generate and send 6-digit OTP to user/admin email
 * @route   POST /api/auth/forgot-password-otp
 * @access  Public
 */
const forgotPasswordOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.',
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = expireTime;
    await user.save({ validateBeforeSave: false });

    // Send email via emailService
    const { sendOtpEmail } = require('../utils/emailService');
    const emailSent = await sendOtpEmail(user.email, user.name, otp);

    const responsePayload = {
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
    };

    // If in development or SMTP is not fully setup, expose devOtp for frictionless testing
    if (process.env.NODE_ENV !== 'production' || !emailSent) {
      responsePayload.devOtp = otp;
    }

    res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
};

// ─── resetPasswordOtp ──────────────────────────────────────────────────────────
/**
 * @desc    Verify OTP and update password for user or admin
 * @route   POST /api/auth/reset-password-otp
 * @access  Public
 */
const resetPasswordOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOtp: otp.toString().trim(),
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new code.',
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save(); // Pre-save hook hashes password

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPasswordOtp,
  resetPasswordOtp,
};
