import { API_URL, getHeaders } from './api.config';

class TrackingService {
  async trackPackage(trackingNumber) {
    try {
      const response = await fetch(`${API_URL}/tracking/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ trackingId: trackingNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track package');
      }

      return data;
    } catch (error) {
      console.error('Tracking error:', error);
      throw error;
    }
  }

  async getTrackingByEmail(email) {
    try {
      const response = await fetch(`${API_URL}/tracking/email/${email}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tracking by email');
      }

      return data;
    } catch (error) {
      console.error('Email tracking error:', error);
      throw error;
    }
  }

  async getPackageHistory(trackingNumber) {
    try {
      const response = await fetch(`${API_URL}/tracking/${trackingNumber}/history`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch package history');
      }

      return data;
    } catch (error) {
      console.error('Package history error:', error);
      throw error;
    }
  }
}

export const trackingService = new TrackingService(); 