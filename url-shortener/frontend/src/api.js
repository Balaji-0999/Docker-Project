import axios from 'axios';

const API_BASE = 'http://54.92.201.3:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Har request ke saath token automatically bhej do (agar login hai)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Agar token expire/invalid ho jaye, automatically login pe bhej do
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const shortenUrl = (originalUrl, customAlias) =>
  api.post('/links/shorten', { originalUrl, customAlias });

export const getLinks = () => api.get('/links');

export const getAnalytics = (linkId) => api.get(`/links/${linkId}/analytics`);

export default api;
