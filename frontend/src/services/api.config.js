// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Default headers for API requests
export const getHeaders = (token = null) => {
  // Use user_token from sessionStorage by default if no token provided
  if (!token && typeof window !== 'undefined') {
    token = sessionStorage.getItem('user_token');
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}; 