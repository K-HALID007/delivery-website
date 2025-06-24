'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import partnerService from '../../../../services/partner.service.js';

export default function DeliveryDetails() {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const router = useRouter();
  const params = useParams();
  const trackingId = params.trackingId;

  useEffect(() => {
    if (!partnerService.isLoggedIn()) {
      router.push('/partner');
      return;
    }
    loadDeliveryDetails();
  }, [trackingId]);

  const loadDeliveryDetails = async () => {
    try {
      setLoading(true);
      // Get delivery details from the deliveries list
      const response = await partnerService.getDeliveries({ trackingId });
      
      if (response.success && response.deliveries.length > 0) {
        const deliveryData = response.deliveries[0];
        setDelivery(deliveryData);
        setStatusUpdate({ status: deliveryData.status, notes: '' });
      } else {
        setError('Delivery not found or not assigned to you');
      }
    } catch (error) {
      setError(error.message);
      if (error.message.includes('unauthorized')) {
        partnerService.logout();
        router.push('/partner');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusUpdate.status) return;

    try {
      setUpdating(true);
      const response = await partnerService.updateDeliveryStatus(trackingId, statusUpdate);
      
      if (response.success) {
        // Reload delivery details
        await loadDeliveryDetails();
        setStatusUpdate({ ...statusUpdate, notes: '' });
        alert('Delivery status updated successfully!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-yellow-100 text-yellow-800',
      'in_transit': 'bg-purple-100 text-purple-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-black';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      'assigned': ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'],
      'picked_up': ['in_transit', 'out_for_delivery', 'delivered'],
      'in_transit': ['out_for_delivery', 'delivered'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };
    return statusFlow[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (error && !delivery) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium text-black">Error loading delivery</p>
            <p className="text-sm mt-1 text-black">{error}</p>
            <button
              onClick={() => router.push('/partner/deliveries')}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              Back to Deliveries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-black">
                Delivery #{trackingId}
              </h1>
              <p className="text-black">Manage delivery status and details</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/partner/deliveries')}
                className="text-black hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                ← Back to Deliveries
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-black px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Overview */}
            <div className="bg-white rounded-lg shadow p-6 text-black">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-black">Delivery Overview</h2>
                  <p className="text-black mt-1">Tracking ID: {delivery?.trackingId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery?.status)}`}>
                    {delivery?.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="text-lg font-semibold text-green-600 mt-2">
                    ₹{delivery?.partnerEarnings || 0}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Sender Details */}
                <div className="border border-gray-200 rounded-lg p-4 text-black">
                  <h3 className="font-medium text-black mb-3">Sender Details</h3>
                  <div className="space-y-2">
                    <p className="text-black"><span className="text-black font-medium">Name:</span> <span className="text-black">{delivery?.sender?.name}</span></p>
                    <p className="text-black"><span className="text-black font-medium">Phone:</span> <span className="text-black">{delivery?.sender?.phone}</span></p>
                    <p className="text-black"><span className="text-black font-medium">Email:</span> <span className="text-black">{delivery?.sender?.email}</span></p>
                    {delivery?.sender?.address && (
                      <p className="text-black"><span className="text-black font-medium">Address:</span> <span className="text-black">{delivery.sender.address}</span></p>
                    )}
                  </div>
                </div>

                {/* Receiver Details */}
                <div className="border border-gray-200 rounded-lg p-4 text-black">
                  <h3 className="font-medium text-black mb-3">Receiver Details</h3>
                  <div className="space-y-2">
                    <p className="text-black"><span className="text-black font-medium">Name:</span> <span className="text-black">{delivery?.receiver?.name}</span></p>
                    <p className="text-black"><span className="text-black font-medium">Phone:</span> <span className="text-black">{delivery?.receiver?.phone}</span></p>
                    <p className="text-black"><span className="text-black font-medium">Email:</span> <span className="text-black">{delivery?.receiver?.email}</span></p>
                    {delivery?.receiver?.address && (
                      <p className="text-black"><span className="text-black font-medium">Address:</span> <span className="text-black">{delivery.receiver.address}</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Details */}
              {delivery?.packageDetails && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4 text-black">
                  <h3 className="font-medium text-black mb-3">Package Details</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <p className="text-black"><span className="text-black font-medium">Weight:</span> <span className="text-black">{delivery.packageDetails.weight} kg</span></p>
                    <p className="text-black"><span className="text-black font-medium">Type:</span> <span className="text-black">{delivery.packageDetails.type}</span></p>
                    <p className="text-black"><span className="text-black font-medium">Value:</span> <span className="text-black">₹{delivery.packageDetails.value}</span></p>
                  </div>
                  {delivery.packageDetails.description && (
                    <p className="mt-2 text-black"><span className="text-black font-medium">Description:</span> <span className="text-black">{delivery.packageDetails.description}</span></p>
                  )}
                </div>
              )}

              {/* Delivery Timeline */}
              <div className="mt-6">
                <h3 className="font-medium text-black mb-4">Delivery Timeline</h3>
                <div className="space-y-4">
                  {delivery?.statusHistory?.map((history, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-black">
                              {history.status?.replace('_', ' ').toUpperCase()}
                            </p>
                            {history.notes && (
                              <p className="text-sm text-black mt-1">{history.notes}</p>
                            )}
                          </div>
                          <span className="text-sm text-black">
                            {formatDate(history.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            {delivery?.status !== 'delivered' && delivery?.status !== 'cancelled' && (
              <div className="bg-white rounded-lg shadow p-6 text-black">
                <h3 className="text-lg font-medium text-black mb-4">Update Status</h3>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      New Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    >
                      <option value={delivery?.status} className="text-black">
                        {delivery?.status?.replace('_', ' ').toUpperCase()} (Current)
                      </option>
                      {getNextStatuses(delivery?.status).map((status) => (
                        <option key={status} value={status} className="text-black">
                          {status.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Add any notes about this status update..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating || statusUpdate.status === delivery?.status}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </form>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 text-black">
              <h3 className="text-lg font-medium text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.open(`tel:${delivery?.sender?.phone}`)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Call Sender
                </button>
                <button
                  onClick={() => window.open(`tel:${delivery?.receiver?.phone}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Call Receiver
                </button>
                <button
                  onClick={() => router.push('/partner/deliveries')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Back to All Deliveries
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow p-6 text-black">
              <h3 className="text-lg font-medium text-black mb-4">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-black font-medium">Created:</span>
                  <span className="text-black">{formatDate(delivery?.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">Last Updated:</span>
                  <span className="text-black">{formatDate(delivery?.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">Earnings:</span>
                  <span className="font-medium text-green-600">₹{delivery?.partnerEarnings || 0}</span>
                </div>
                {delivery?.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-black font-medium">Delivered:</span>
                    <span className="text-black">{formatDate(delivery.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}