"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { API_URL } from '../../../services/api.config.js';

export default function SimpleAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Loading simple admin dashboard...');
        
        // Check authentication
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
          setError('Not authenticated as admin');
          setLoading(false);
          return;
        }

        const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Set default data first
        setSummary({ totalShipments: 0, activeUsers: 0, revenue: 0, pendingDeliveries: 0 });
        setNotifications([
          { id: 1, message: 'Loading dashboard data...', type: 'info' }
        ]);

        // Try to fetch summary data
        try {
          const response = await fetch(`${API_URL}/admin/summary`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            signal: AbortSignal.timeout(10000)
          });

          if (response.ok) {
            const data = await response.json();
            setSummary({
              totalShipments: data.activeShipments || data.totalShipments || 0,
              activeUsers: data.totalUsers || data.activeUsers || 0,
              revenue: data.totalRevenue || data.revenue || 0,
              pendingDeliveries: data.pendingDeliveries || 0,
            });
            setNotifications([
              { id: 1, message: 'Dashboard loaded successfully', type: 'success' }
            ]);
          } else {
            console.error('API response not ok:', response.status, response.statusText);
            setNotifications([
              { id: 1, message: `API Error: ${response.status} ${response.statusText}`, type: 'error' }
            ]);
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
          setNotifications([
            { id: 1, message: `API call failed: ${apiError.message}`, type: 'error' }
          ]);
        }

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
        setNotifications([
          { id: 1, message: `Dashboard error: ${err.message}`, type: 'error' }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading simple dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
            >
              Reload
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Simple Admin Dashboard</h1>
        
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg mb-2 ${
                  notification.type === 'success' ? 'bg-green-100 text-green-800' :
                  notification.type === 'error' ? 'bg-red-100 text-red-800' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">{summary?.totalShipments || 0}</div>
            <div className="text-gray-800 mt-2 font-medium">Total Shipments</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary?.activeUsers || 0}</div>
            <div className="text-gray-800 mt-2 font-medium">Active Users</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">₹{summary?.revenue?.toLocaleString() || '0'}</div>
            <div className="text-gray-800 mt-2 font-medium">Revenue</div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{summary?.pendingDeliveries || 0}</div>
            <div className="text-gray-800 mt-2 font-medium">Pending Deliveries</div>
          </div>
        </div>

        {/* Simple Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-black">Analytics Overview</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 mb-2">📊</div>
              <div className="text-gray-600">Chart placeholder</div>
              <div className="text-sm text-gray-500">Charts will load here when Chart.js is working</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-black">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Full Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin/test'}
              className="bg-amber-500 text-white p-4 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Test Authentication
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white p-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}