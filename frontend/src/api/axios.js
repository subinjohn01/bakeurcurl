import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('BakeUrCurl_token');
    if (token) {
      config.headers.Authorization = `Bearer ₹{token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('BakeUrCurl_token');
      localStorage.removeItem('BakeUrCurl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
