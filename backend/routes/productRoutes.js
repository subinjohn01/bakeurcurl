/**
 * BakeUrCurl — Product Routes
 *
 * GET    /api/products         Get all products (public)
 * POST   /api/products         Create product (admin)
 * GET    /api/products/:id     Get product by ID (public)
 * PUT    /api/products/:id     Update product (admin)
 * DELETE /api/products/:id     Soft-delete product (admin)
 */

const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
