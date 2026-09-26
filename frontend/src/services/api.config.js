// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Default headers for API requests
export const getHeaders = (token = null) => {
  if (!token && typeof window !== 'undefined') {
    token =
      sessionStorage.getItem('user_token') ||
      sessionStorage.getItem('admin_token') ||
      localStorage.getItem('token');
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export default { API_URL, getHeaders };