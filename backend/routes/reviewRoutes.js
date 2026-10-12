/**
 * BakeUrCurl — Review Routes
 */

const express = require('express');
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.route('/')
  .get(getReviews)
  .post(optionalAuth, createReview);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteReview);

module.exports = router;
