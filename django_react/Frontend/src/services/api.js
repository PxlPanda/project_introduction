import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Authentication related API calls
export const login = (credentials) => {
  return api.post('/token/', credentials);
};

// Hall related API calls
export const fetchHalls = (params) => {
  return api.get('/halls/', { params });
};

export const pinHall = (hallId) => {
  return api.post(`/halls/${hallId}/pin/`);
};

export const unpinHall = (hallId) => {
  return api.post(`/halls/${hallId}/unpin/`);
};

// Booking related API calls
export const createBooking = (data) => {
  return api.post('/bookings/', data);
};

export const cancelBooking = (bookingId) => {
  return api.delete(`/bookings/${bookingId}/`);
};

export default api;