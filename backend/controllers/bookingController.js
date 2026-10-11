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

const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');

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
      // Guest fields (used when not authenticated)
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    // Validate service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive.' });
    }

    // Validate staff exists and is active
    const staff = await User.findOne({ _id: staffId, role: 'staff', isActive: true });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found or unavailable.' });
    }

    // Check for slot conflict (same staff, same date, same time)
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflict = await Booking.findOne({
      staff: staffId,
      date: { $gte: bookingDate, $lt: nextDay },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked for the selected staff member.',
      });
    }

    // Determine 30% advance payment amount
    const totalAmount = service.price;
    const advanceAmount = parseFloat((totalAmount * 0.3).toFixed(2));

    // Build booking document
    const bookingData = {
      service: serviceId,
      staff: staffId,
      date: bookingDate,
      timeSlot,
      totalAmount,
      advanceAmount,
      notes: notes || '',
    };

    if (req.user) {
      // Authenticated customer
      bookingData.customer = req.user._id;
    } else {
      // Guest booking — require guest info
      if (!guestName || !guestEmail || !guestPhone) {
        return res.status(400).json({
          success: false,
          message: 'Guest name, email, and phone are required for guest bookings.',
        });
      }
      bookingData.guestInfo = { name: guestName, email: guestEmail, phone: guestPhone };
    }

    const booking = await Booking.create(bookingData);

    // Populate for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'name price duration')
      .populate('staff', 'name email');

    // Send confirmation email (non-blocking)
    try {
      const recipientEmail = req.user ? req.user.email : guestEmail;
      const recipientName = req.user ? req.user.name : guestName;
      await sendBookingConfirmation(recipientEmail, recipientName, populatedBooking);
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr.message);
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

    if (!staffId || !date) {
      return res.status(400).json({
        success: false,
        message: 'staffId and date query parameters are required.',
      });
    }

    // Validate staff exists
    const staff = await User.findOne({ _id: staffId, role: 'staff', isActive: true });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    // Get booked slots for this staff + date
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedSlots = await Booking.find({
      staff: staffId,
      date: { $gte: d, $lt: nextDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

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
      staff: { id: staff._id, name: staff.name },
      availableSlots,
      bookedSlots: Array.from(bookedSlotSet),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
};
