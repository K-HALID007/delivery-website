import { API_URL } from './api.config.js';

class PartnerService {
  constructor() {
    this.baseURL = `${API_URL}/partner`;
  }

  // Get auth headers
  getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('partnerToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Partner Registration
  async register(partnerData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(partnerData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Partner registration error:', error);
      throw error;
    }
  }

  // Partner Login
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and partner data
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('partnerToken', data.token);
        localStorage.setItem('partnerData', JSON.stringify(data.partner));
      }

      return data;
    } catch (error) {
      console.error('Partner login error:', error);
      throw error;
    }
  }

  // Get Partner Profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get partner profile error:', error);
      throw error;
    }
  }

  // Update Partner Profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      return data;
    } catch (error) {
      console.error('Update partner profile error:', error);
      throw error;
    }
  }

  // Get Partner Dashboard
  async getDashboard() {
    try {
      const response = await fetch(`${this.baseURL}/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard');
      }

      return data;
    } catch (error) {
      console.error('Get partner dashboard error:', error);
      throw error;
    }
  }

  // Get Partner Deliveries
  async getDeliveries(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}/deliveries?${queryString}`;
      const headers = this.getAuthHeaders();
      
      console.log('🔍 Partner Deliveries API Call:', {
        url,
        params,
        headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'None' }
      });

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('📡 Partner Deliveries API Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const data = await response.json();
      
      console.log('📦 Partner Deliveries Data:', {
        success: data.success,
        deliveriesCount: data.deliveries?.length || 0,
        totalRecords: data.pagination?.totalRecords || 0,
        error: data.message
      });
      
      if (!response.ok) {
        console.error('❌ Partner Deliveries API Error:', data);
        throw new Error(data.message || 'Failed to fetch deliveries');
      }

      return data;
    } catch (error) {
      console.error('❌ Get partner deliveries error:', error);
      
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to server. Please check your internet connection.');
      }
      
      // Check if it's an authentication error
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        throw new Error('Authentication failed. Please login again.');
      }
      
      throw error;
    }
  }

  // Update Delivery Status
  async updateDeliveryStatus(trackingId, statusData) {
    try {
      const response = await fetch(`${this.baseURL}/deliveries/${trackingId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(statusData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update delivery status');
      }

      return data;
    } catch (error) {
      console.error('Update delivery status error:', error);
      throw error;
    }
  }

  // Update Partner Location
  async updateLocation(location) {
    try {
      const response = await fetch(`${this.baseURL}/location`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(location)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update location');
      }

      return data;
    } catch (error) {
      console.error('Update partner location error:', error);
      throw error;
    }
  }

  // Toggle Online Status
  async toggleOnlineStatus() {
    try {
      const response = await fetch(`${this.baseURL}/toggle-online`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle online status');
      }

      // If partner just came online, trigger a refresh of deliveries after a short delay
      if (data.isOnline) {
        console.log('🟢 Partner came online, will refresh deliveries in 3 seconds...');
        setTimeout(() => {
          // Trigger a custom event that components can listen to
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('partnerOnline', { 
              detail: { partnerId: this.getStoredPartnerData()?.id } 
            }));
          }
        }, 3000); // Wait 3 seconds for backend assignment to process
      }

      return data;
    } catch (error) {
      console.error('Toggle online status error:', error);
      throw error;
    }
  }

  // Get Partner Earnings
  async getEarnings(period = 'month') {
    try {
      const response = await fetch(`${this.baseURL}/earnings?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch earnings');
      }

      return data;
    } catch (error) {
      console.error('Get partner earnings error:', error);
      throw error;
    }
  }

  // Logout - Enhanced version
  logout() {
    try {
      if (typeof window === 'undefined') return false;
      
      console.log('Clearing partner localStorage...');
      
      // Remove specific partner items
      localStorage.removeItem('partnerToken');
      localStorage.removeItem('partnerData');
      
      // Clear any other partner-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('partner')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('Partner localStorage cleared successfully');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  // Check if partner is logged in
  isLoggedIn() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('partnerToken');
    return !!token;
  }

  // Get stored partner data
  getStoredPartnerData() {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('partnerData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing stored partner data:', error);
      return null;
    }
  }
}

export default new PartnerService();