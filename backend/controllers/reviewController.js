/**
 * BakeUrCurl — Review & Rating Controller
 */

const Review = require('../models/Review');

// @desc    Submit a customer review & star rating
// @route   POST /api/reviews
// @access  Public / Customer Auth
const createReview = async (req, res, next) => {
  try {
    const { name, curlType, rating, comment, serviceName } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ success: false, message: 'Name and review comment are required.' });
    }

    const starRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const review = await Review.create({
      customer: req.user ? req.user._id : null,
      name: name.trim(),
      curlType: curlType ? curlType.trim() : 'Curly Hair',
      rating: starRating,
      comment: comment.trim(),
      serviceName: serviceName ? serviceName.trim() : '',
      isApproved: true,
    });

    res.status(201).json({ success: true, message: 'Thank you for your rating & review! ⭐', review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a review (admin)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getReviews,
  deleteReview,
};
