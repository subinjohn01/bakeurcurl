/**
 * BakeUrCurl — Customer Review & Rating Model
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    curlType: {
      type: String,
      trim: true,
      default: 'Curly & Textured',
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating.'],
      min: [1, 'Rating must be at least 1 star.'],
      max: [5, 'Rating cannot exceed 5 stars.'],
      default: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write a review comment.'],
      maxlength: [600, 'Review cannot exceed 600 characters.'],
      trim: true,
    },
    serviceName: {
      type: String,
      trim: true,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true, // auto-approve for instant feedback
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
