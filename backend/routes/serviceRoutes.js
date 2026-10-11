/**
 * BakeUrCurl — Service Routes
 *
 * GET    /api/services         Get all active services (public)
 * POST   /api/services         Create service (admin)
 * GET    /api/services/:id     Get service by ID (public)
 * PUT    /api/services/:id     Update service (admin)
 * DELETE /api/services/:id     Soft-delete service (admin)
 */

const express = require('express');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getServices)
  .post(protect, authorize('admin'), createService);

router
  .route('/:id')
  .get(getServiceById)
  .put(protect, authorize('admin'), updateService)
  .delete(protect, authorize('admin'), deleteService);

module.exports = router;
