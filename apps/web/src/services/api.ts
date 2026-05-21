import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
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

export const authService = {
  register: (email: string, password: string, phone: string, user_type: string) =>
    api.post('/auth/register', { email, password, phone, user_type }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
};

export const ridesService = {
  request: (passenger_id: string, origin: any, destination: any) =>
    api.post('/rides/request', { passenger_id, origin, destination }),
  getActive: (user_id: string, user_type: string) =>
    api.get('/rides/active/list', { params: { user_id, user_type } }),
  accept: (ride_id: string, driver_id: string) =>
    api.post(`/rides/${ride_id}/accept`, { driver_id }),
  complete: (ride_id: string, fare_amount: number) =>
    api.post(`/rides/${ride_id}/complete`, { fare_amount }),
};

export const paymentsService = {
  process: (ride_id: string, amount: number, method: string) =>
    api.post('/payments/process', { ride_id, amount, method }),
};

export const emergencyService = {
  panic: (user_id: string, ride_id: string, latitude: number, longitude: number) =>
    api.post('/emergency/panic', { user_id, ride_id, latitude, longitude }),
};

export default api;
