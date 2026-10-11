/**
 * BakeUrCurl — Product Model
 *
 * Represents a retail hair product sold at the salon.
 * Categories: shampoo | conditioner | styling | treatment | tools
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name.'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description.'],
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price.'],
      min: [0, 'Price cannot be negative.'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category.'],
      enum: {
        values: ['shampoo', 'conditioner', 'styling', 'treatment', 'tools'],
        message:
          "Category must be 'shampoo', 'conditioner', 'styling', 'treatment', or 'tools'.",
      },
    },
    brand: {
      type: String,
      required: [true, 'Please provide the brand name.'],
      trim: true,
      maxlength: [80, 'Brand name cannot exceed 80 characters.'],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide the stock quantity.'],
      min: [0, 'Stock cannot be negative.'],
      default: 0,
    },
    images: {
      type: [String],
      default: [], // Array of image URLs / file paths
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

// Virtual: inStock flag (derived from stock > 0)
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
