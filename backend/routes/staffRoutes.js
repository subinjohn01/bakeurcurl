/**
 * BakeUrCurl — Staff Routes
 *
 * GET    /api/staff                  Get all active staff (public — for booking form)
 * POST   /api/staff                  Create staff member (admin)
 * PUT    /api/staff/:id              Update staff (admin)
 * DELETE /api/staff/:id              Deactivate staff (admin)
 * GET    /api/staff/:id/schedule     Get staff schedule (admin/staff-own)
 */

const express = require('express');
const {
  getStaff,
  createStaffMember,
  updateStaff,
  deleteStaff,
  getStaffSchedule,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getStaff)                                        // Public
  .post(protect, authorize('admin'), createStaffMember); // Admin only

router
  .route('/:id')
  .put(protect, authorize('admin'), updateStaff)
  .delete(protect, authorize('admin'), deleteStaff);

router.get(
  '/:id/schedule',
  protect,
  authorize('admin', 'staff'),
  getStaffSchedule
);

module.exports = router;
