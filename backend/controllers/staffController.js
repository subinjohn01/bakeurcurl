/**
 * BakeUrCurl — Staff Controller
 *
 * Functions:
 *   getStaff            GET    /api/staff              (public — for booking form)
 *   createStaffMember   POST   /api/staff              (admin)
 *   updateStaff         PUT    /api/staff/:id          (admin)
 *   deleteStaff         DELETE /api/staff/:id          (admin)
 *   getStaffSchedule    GET    /api/staff/:id/schedule (admin/staff)
 */

const User = require('../models/User');
const Booking = require('../models/Booking');

// ─── getStaff ─────────────────────────────────────────────────────────────────
/**
 * @desc    Get all active staff members (for booking selection)
 * @route   GET /api/staff
 * @access  Public
 */
const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true })
      .select('name email avatar specialization bio')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (err) {
    next(err);
  }
};

// ─── createStaffMember ────────────────────────────────────────────────────────
/**
 * @desc    Create a new staff member account
 * @route   POST /api/staff
 * @access  Private — admin
 */
const createStaffMember = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, bio, avatar } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const staff = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'staff',
      specialization: specialization || '',
      bio: bio || '',
      avatar: avatar || '',
    });

    // Don't return password
    const staffObj = staff.toObject();
    delete staffObj.password;

    res.status(201).json({ success: true, staff: staffObj });
  } catch (err) {
    next(err);
  }
};

// ─── updateStaff ──────────────────────────────────────────────────────────────
/**
 * @desc    Update a staff member's profile
 * @route   PUT /api/staff/:id
 * @access  Private — admin
 */
const updateStaff = async (req, res, next) => {
  try {
    // Verify the target user is a staff member
    const target = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    const allowedFields = ['name', 'phone', 'specialization', 'bio', 'avatar', 'isActive'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, staff: updated });
  } catch (err) {
    next(err);
  }
};

// ─── deleteStaff ──────────────────────────────────────────────────────────────
/**
 * @desc    Deactivate a staff member (soft delete)
 * @route   DELETE /api/staff/:id
 * @access  Private — admin
 */
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { $set: { isActive: false } },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    res.status(200).json({ success: true, message: 'Staff member deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── getStaffSchedule ─────────────────────────────────────────────────────────
/**
 * @desc    Get a staff member's bookings for a given date range
 * @route   GET /api/staff/:id/schedule?startDate=&endDate=
 * @access  Private — admin, staff (own)
 */
const getStaffSchedule = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const staffId = req.params.id;

    // Staff can only view their own schedule
    if (req.user.role === 'staff' && req.user._id.toString() !== staffId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const staff = await User.findOne({ _id: staffId, role: 'staff' }).select('name email specialization');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    const dateFilter = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      dateFilter.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      dateFilter.$lte = e;
    }

    const filter = { staff: staffId };
    if (Object.keys(dateFilter).length) filter.date = dateFilter;

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('service', 'name duration price')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      staff,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStaff, createStaffMember, updateStaff, deleteStaff, getStaffSchedule };
