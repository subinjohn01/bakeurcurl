/**
 * BakeUrCurl — Customer Management Routes (Admin)
 *
 * GET    /api/customers        List all customers
 * GET    /api/customers/:id    Get customer with booking history
 * POST   /api/customers        Create new customer
 * PUT    /api/customers/:id    Update customer profile (name, phone, email, address, birthday)
 * DELETE /api/customers/:id    Delete customer
 */

const express = require('express');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router
  .route('/')
  .get(getAllCustomers)
  .post(createCustomer);

router
  .route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
