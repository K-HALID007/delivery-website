"use client";
import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, DollarSign, Package, Users } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time notifications (in production, this would be WebSocket/SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for new refund requests
      checkForNewRefunds();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const checkForNewRefunds = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch('https://delivery-backend100.vercel.app/api/admin/refunds', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const refunds = await response.json();
        
        // Check for new refunds (created in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const newRefunds = refunds.filter(refund => 
          new Date(refund.refundRequestedAt) > fiveMinutesAgo
        );

        // Add new refund notifications
        newRefunds.forEach(refund => {
          const notificationExists = notifications.some(n => 
            n.id === `refund_${refund.trackingId}`
          );

          if (!notificationExists) {
            addNotification({
              id: `refund_${refund.trackingId}`,
              type: 'refund',
              title: 'New Refund Request',
              message: `${refund.customerName} requested refund for ${refund.trackingId}`,
              amount: refund.amount,
              trackingId: refund.trackingId,
              timestamp: new Date(),
              read: false
            });
          }
        });
      }
    } catch (error) {
      console.error('Error checking for new refunds:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'refund':
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      case 'shipment':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
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
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">New refund requests will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          Amount: ₹{notification.amount.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons for Refund Notifications */}
                  {notification.type === 'refund' && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/admin/refunds/${notification.trackingId}`;
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Review
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/admin/tracking/${notification.trackingId}`;
                        }}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <a
                href="/admin/notifications"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}