import api from './axios';

export const submitQuery = (data) => api.post('/queries', data);
export const getQueries = (params) => api.get('/queries', { params });
export const replyToQuery = (id, message) => api.post(`/queries/${id}/reply`, { message });
export const markAsRead = (id) => api.patch(`/queries/${id}/read`);
