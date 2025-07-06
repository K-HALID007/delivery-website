"use client";
import { useState, useEffect } from 'react';
import { Bell, AlertCircle, DollarSign, Clock, User } from 'lucide-react';

export default function RefundNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch refund notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
      
      if (!token) return;

      const response = await fetch('https://delivery-backend100.vercel.app/api/admin/refunds', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert refunds to notifications
        const refundNotifications = data.map(refund => ({
          id: `refund_${refund.trackingId}`,
          type: 'refund',
          title: 'Refund Request',
          message: `${refund.customerName} requested ₹${refund.amount?.toLocaleString()} refund`,
          trackingId: refund.trackingId,
          amount: refund.amount,
          customerName: refund.customerName,
          reason: refund.reason,
          timestamp: new Date(refund.refundRequestedAt),
          isNew: new Date() - new Date(refund.refundRequestedAt) < 24 * 60 * 60 * 1000 // Less than 24 hours
        }));

        setNotifications(refundNotifications);
        setUnreadCount(refundNotifications.filter(n => n.isNew).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh notifications
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        title="Refund Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">Refund Requests</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No refund requests</p>
                <p className="text-sm">New requests will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.isNew ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.isNew ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          notification.isNew ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">
                          {notification.title}
                        </p>
                        {notification.isNew && (
                          <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{notification.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{notification.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                      {notification.reason && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Reason: {notification.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/refunds`;
                      }}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                    >
                      Review Request
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/tracking/${notification.trackingId}`;
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                    >
                      View Shipment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <a
                href="/admin/refunds"
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                View All Refund Requests →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}