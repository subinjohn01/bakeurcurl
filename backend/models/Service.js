/**
 * BakeUrCurl — Service Model
 *
 * Represents a salon service (e.g. Curly Cut, Deep Conditioning Treatment).
 * Categories: haircut | treatment | styling | coloring
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name.'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a service description.'],
      maxlength: [1000, 'Description cannot exceed 1000 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a service price.'],
      min: [0, 'Price cannot be negative.'],
    },
    duration: {
      // Duration in minutes
      type: Number,
      required: [true, 'Please provide the service duration in minutes.'],
      min: [15, 'Duration must be at least 15 minutes.'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category.'],
      trim: true,
    },
    image: {
      type: String,
      default: '', // URL or file path
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ price: 1 });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
