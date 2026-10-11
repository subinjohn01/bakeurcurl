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
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public — must come before /:id to avoid conflict
router.get('/available-slots', getAvailableSlots);

// Auth — customer/staff/admin
router.post('/', createBooking); // Supports both guest and auth
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);

// Staff / Admin only
router.patch('/:id/status', protect, authorize('staff', 'admin'), updateBookingStatus);

// Any authenticated user (customer cancels own, admin/staff cancel any)
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
