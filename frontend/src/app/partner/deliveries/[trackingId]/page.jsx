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
    notes: '',
    deliveryProof: null,
    receiverName: '',
    receiverSignature: ''
  });
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
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

    // If updating to delivered, show confirmation modal
    if (statusUpdate.status === 'delivered' && !showDeliveryConfirmation) {
      setShowDeliveryConfirmation(true);
      return;
    }

    try {
      setUpdating(true);
      const response = await partnerService.updateDeliveryStatus(trackingId, statusUpdate);
      
      if (response.success) {
        // Reload delivery details
        await loadDeliveryDetails();
        setStatusUpdate({ 
          status: '', 
          notes: '', 
          deliveryProof: null, 
          receiverName: '', 
          receiverSignature: '' 
        });
        setShowDeliveryConfirmation(false);
        alert('Delivery status updated successfully!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryConfirmation = async (e) => {
    e.preventDefault();
    
    // Validate delivery confirmation
    if (!statusUpdate.receiverName.trim()) {
      alert('Please enter receiver name');
      return;
    }

    await handleStatusUpdate(e);
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
      'assigned': ['picked_up'],
      'picked_up': ['in_transit'],
      'in_transit': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'assigned': 'Assigned',
      'picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'assigned': 'Package assigned to delivery partner',
      'picked_up': 'Package collected from sender',
      'in_transit': 'Package in transit to destination',
      'out_for_delivery': 'Package out for final delivery',
      'delivered': 'Package delivered successfully',
      'cancelled': 'Delivery cancelled'
    };
    return descriptions[status] || '';
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
      {/* Delivery Confirmation Modal */}
      {showDeliveryConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-4">Confirm Delivery</h3>
            <form onSubmit={handleDeliveryConfirmation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Receiver Name *
                </label>
                <input
                  type="text"
                  value={statusUpdate.receiverName}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, receiverName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Who received the package?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Delivery Notes
                </label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Package delivered to front door, handed to security, etc."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryConfirmation(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Confirming...' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                    {getStatusLabel(delivery?.status)}
                  </span>
                  <div className="text-xs text-gray-600 mt-1">
                    {getStatusDescription(delivery?.status)}
                  </div>
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
                              {getStatusLabel(history.status)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {getStatusDescription(history.status)}
                            </p>
                            {history.notes && (
                              <p className="text-sm text-black mt-1 bg-gray-50 p-2 rounded">
                                Note: {history.notes}
                              </p>
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
            {/* Delivered Status Display */}
            {delivery?.status === 'delivered' && (
              <div className="bg-green-50 border border-green-200 rounded-lg shadow p-6 text-black">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Package Delivered</h3>
                  <p className="text-green-700 mb-4">Delivery completed successfully</p>
                  
                  {delivery?.deliveredAt && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="text-sm text-gray-600 mb-2">Delivery Details:</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Delivered At:</span>
                          <span>{formatDate(delivery.deliveredAt)}</span>
                        </div>
                        {delivery?.receiverName && (
                          <div className="flex justify-between">
                            <span className="font-medium">Received By:</span>
                            <span>{delivery.receiverName}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium">Earnings:</span>
                          <span className="text-green-600 font-semibold">₹{delivery?.partnerEarnings || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Payment processed
                  </div>
                </div>
              </div>
            )}

            {/* Status Update */}
            {delivery?.status !== 'delivered' && delivery?.status !== 'cancelled' && (
              <div className="bg-white rounded-lg shadow p-6 text-black border-l-4 border-blue-500">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium text-black">Update Delivery Status</h3>
                </div>
                
                {/* Current Status Display */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Current Status:</div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery?.status)}`}>
                      {getStatusLabel(delivery?.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getStatusDescription(delivery?.status)}
                  </div>
                </div>

                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Select New Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                      required
                    >
                      <option value={delivery?.status} className="text-gray-500">
                        {getStatusLabel(delivery?.status)} (Current)
                      </option>
                      {getNextStatuses(delivery?.status).map((status) => (
                        <option key={status} value={status} className="text-black">
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                    
                    {/* Show description for selected status */}
                    {statusUpdate.status !== delivery?.status && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        {getStatusDescription(statusUpdate.status)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Add delivery notes, customer instructions, or any relevant information..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating || statusUpdate.status === delivery?.status}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                  >
                    {updating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Status...
                      </span>
                    ) : (
                      'Update Status'
                    )}
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