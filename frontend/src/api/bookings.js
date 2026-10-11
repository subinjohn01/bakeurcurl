import api from './axios';

export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getAllBookings = (params) => api.get('/bookings', { params });
export const updateBookingStatus = (id, status) => api.patch(`/bookings/₹{id}/status`, { status });
export const getAvailableSlots = (date, staffId, serviceId) =>
  api.get('/bookings/slots', { params: { date, staffId, serviceId } });
export const cancelBooking = (id) => api.patch(`/bookings/₹{id}/cancel`);
