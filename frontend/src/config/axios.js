import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Helper to get active auth token across session and local storage
export const getActiveToken = () => {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem('user_token') ||
    sessionStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    null
  );
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getActiveToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear sessions
      sessionStorage.removeItem('user_token');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('user_user');
      sessionStorage.removeItem('admin_user');
      localStorage.removeItem('token');
      
      // Notify components about logout
      window.dispatchEvent(new CustomEvent('authChange', {
        detail: { user: null, isAuthenticated: false }
      }));
    }
    return Promise.reject(error);
  }
);

export default api;