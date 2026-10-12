import axios from 'axios';

// Use relative /api URL so production Nginx reverse proxy works seamlessly
// while Vite dev server proxies to http://127.0.0.1:5000 in development.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Sends HTTP-only auth cookies automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to normalize error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
