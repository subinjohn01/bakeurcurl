/**
 * BakeUrCurl — User Model
 *
 * Roles: 'customer' | 'staff' | 'admin'
 * Methods: matchPassword(), generateAuthToken()
 * Pre-save hook: bcrypt password hashing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name.'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      select: false, // Never return password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please enter a valid phone number.'],
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    birthday: {
      type: String, // Stored as YYYY-MM-DD or date string
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'staff', 'admin'],
        message: "Role must be 'customer', 'staff', or 'admin'.",
      },
      default: 'customer',
    },
    avatar: {
      type: String,
      default: '', // URL to avatar image
    },
    // Staff-specific fields
    specialization: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters.'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Pre-save hook: hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash when password is new or modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * matchPassword — compare a plain-text candidate with the stored hash.
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * generateAuthToken — sign and return a JWT.
 * @returns {string} Signed JWT
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
