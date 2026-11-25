import axios from 'axios';

// Normalize API Base URL:
// In production, uses VITE_API_URL (e.g. https://your-backend.onrender.com/api)
// In local dev, falls back to '/api' which Vite proxies to localhost:5000
const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add Authorization Bearer token to all admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rksd_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle expired sessions or unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (!isLoginRequest && (status === 401 || status === 403)) {
      if (localStorage.getItem('rksd_admin_token')) {
        localStorage.removeItem('rksd_admin_token');
        window.dispatchEvent(new CustomEvent('rksd:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Resolves full asset URL for images and PDFs.
 * Handles Cloudinary URLs (https://res.cloudinary.com/...)
 * and legacy relative paths (/uploads/...) cleanly on production Netlify deployments.
 */
export const getAssetUrl = (urlOrPath) => {
  if (!urlOrPath) return '';

  // If already an absolute cloud URL (Cloudinary, external), return as is
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // If running against an external backend (e.g. on Render), prefix relative upload path
  if (rawApiUrl) {
    const backendOrigin = rawApiUrl.replace(/\/api\/?$/, '');
    const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
    return `${backendOrigin}${cleanPath}`;
  }

  // Fallback for local Vite proxy
  return urlOrPath;
};

export default api;
