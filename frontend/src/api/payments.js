import api from './axios';

export const createPaymentIntent = (bookingId, amount) =>
  api.post('/payments/intent', { bookingId, amount });

export const getPaymentStatus = (bookingId) =>
  api.get(`/payments/status/${bookingId}`);
