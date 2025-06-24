import { API_URL } from './api.config.js';

class AdminService {
  constructor() {
    this.baseUrl = `${API_URL}/admin`;
    this.token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
  }

  async getDashboardStats() {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token || token.split('.').length !== 3) {
        throw new Error('No valid admin token found. Please log in again.');
      }
      
      console.log('🔍 Admin Dashboard Stats API Call:', {
        url: `${this.baseUrl}/summary`,
        hasToken: !!token
      });

      const response = await fetch(`${this.baseUrl}/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📡 Admin Dashboard Stats Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const data = await response.json();
      
      console.log('📊 Admin Dashboard Stats Data:', data);

      if (!response.ok) {
        console.error('❌ Admin Dashboard Stats Error:', data);
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      
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

  async getRecentShipments() {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token || token.split('.').length !== 3) {
        throw new Error('No valid admin token found. Please log in again.');
      }
      const response = await fetch(`${this.baseUrl}/shipments/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent shipments');
      }

      return data;
    } catch (error) {
      console.error('Error fetching recent shipments:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token || token.split('.').length !== 3) {
        throw new Error('No valid admin token found. Please log in again.');
      }
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUserStatus(userId, isActive) {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token || token.split('.').length !== 3) {
        throw new Error('No valid admin token found. Please log in again.');
      }
      const response = await fetch(`${this.baseUrl}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }

      return data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async updateShipmentStatus(shipmentId, status) {
    try {
      const response = await fetch(`${this.baseUrl}/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update shipment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getRevenueStats(timeframe = 'monthly') {
    try {
      const response = await fetch(`${this.baseUrl}/revenue?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }

  async updateTrackingStatus(trackingId, status, currentLocation) {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token || token.split('.').length !== 3) {
        throw new Error('No valid admin token found. Please log in again.');
      }
      
      console.log('Updating tracking status:', { trackingId, status, currentLocation });
      
      const response = await fetch(`${this.baseUrl}/shipments/${trackingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, currentLocation }),
      });
      
      const data = await response.json();
      console.log('Update response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating tracking status:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();