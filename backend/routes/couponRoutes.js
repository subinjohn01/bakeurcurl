/**
 * BakeUrCurl — Coupon / Loyalty Routes
 *
 * GET    /api/coupons          Admin list all coupons
 * POST   /api/coupons          Admin issue coupon to customer
 * DELETE /api/coupons/:id      Admin delete coupon
 * GET    /api/coupons/my       Customer get their active coupons
 * POST   /api/coupons/validate Validate coupon during booking
 */

const express = require('express');
const {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  getMyCoupons,
  validateCoupon,
  getCustomers,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.get('/customers', protect, authorize('admin'), getCustomers);

router
  .route('/')
  .get(protect, authorize('admin'), getAllCoupons)
  .post(protect, authorize('admin'), createCoupon);

router
  .route('/:id')
  .delete(protect, authorize('admin'), deleteCoupon);

// Customer specific route
router.get('/my', protect, getMyCoupons);

// Validate coupon route (authenticated customer or guest passing email)
// Optional protect: can be used with JWT or guest email
router.post('/validate', (req, res, next) => {
  // Try protect if Authorization header exists, otherwise proceed
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => validateCoupon(req, res, next));
  }
  return validateCoupon(req, res, next);
});

module.exports = router;
