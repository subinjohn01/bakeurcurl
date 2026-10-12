/**
 * BakeUrCurl — Booking Routes
 *
 * GET    /api/bookings/available-slots   Get available time slots (public)
 * POST   /api/bookings                   Create booking (public/auth)
 * GET    /api/bookings                   Get bookings (auth)
 * GET    /api/bookings/:id               Get booking by ID (auth)
 * PATCH  /api/bookings/:id/status        Update status (staff/admin)
 * PATCH  /api/bookings/:id/cancel        Cancel booking (auth)
 */

const express = require('express');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
  sendDailyReminders,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Optional auth helper: decodes JWT into req.user if Bearer token present
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// Public / Cron — must come before /:id to avoid conflict
router.get('/available-slots', getAvailableSlots);
router.route('/send-daily-reminders')
  .post(optionalAuth, sendDailyReminders)
  .get(optionalAuth, sendDailyReminders);

// Auth — customer/staff/admin
router.post('/', optionalAuth, createBooking); // Supports guest, customer, and admin
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);

// Staff / Admin only: Full booking update & status update
router.put('/:id', protect, authorize('staff', 'admin'), updateBooking);
router.patch('/:id/status', protect, authorize('staff', 'admin'), updateBookingStatus);

// Any authenticated user (customer cancels own, admin/staff cancel any)
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
