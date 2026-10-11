/**
 * BakeUrCurl — Payment Routes
 *
 * POST  /api/payments/create-intent    Create Stripe PaymentIntent (public/auth)
 * POST  /api/payments/webhook          Stripe webhook handler (raw body)
 * GET   /api/payments/status/:bookingId Get payment status (auth)
 */

const express = require('express');
const {
  createPaymentIntent,
  webhookHandler,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// NOTE: /webhook uses raw body — already handled in server.js before the JSON parser
router.post('/webhook', webhookHandler);

// Create a Stripe PaymentIntent for a booking's advance payment
router.post('/create-intent', createPaymentIntent);

// Check payment status (authenticated)
router.get('/status/:bookingId', protect, getPaymentStatus);

module.exports = router;
