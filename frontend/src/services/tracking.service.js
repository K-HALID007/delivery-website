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

  async downloadInvoice(trackingId) {
    const token = typeof window !== 'undefined'
      ? (sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token') || localStorage.getItem('token'))
      : null;
    const response = await fetch(`${API_URL}/tracking/invoice/${encodeURIComponent(trackingId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || 'Could not download invoice');
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prime_Dispatcher_Invoice_${trackingId}.pdf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
