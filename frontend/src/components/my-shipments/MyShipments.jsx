'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, MapPin, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import { authService } from '@/services/auth.service';
import { toast } from 'react-hot-toast';
import RefundModal from '@/components/modals/RefundModal';
import ComplaintModal from '@/components/modals/ComplaintModal';

export default function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = sessionStorage.getItem('user_token');
        console.log('Token from sessionStorage:', token ? 'Present' : 'Missing');
        console.log('Token length:', token ? token.length : 0);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('Making request to fetch shipments...');
        const response = await fetch('https://delivery-backend100.vercel.app/api/tracking/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          const errorData = await response.json();
          console.log('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch shipments');
        }

        const data = await response.json();
        console.log('Shipments data received:', data);
        setShipments(Array.isArray(data) ? data : data.shipments || []);
      } catch (err) {
        console.error('Fetch shipments error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const currentUser = authService.getCurrentUser();
    console.log('Current user:', currentUser);
    setUser(currentUser);

    fetchShipments();
  }, [router]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'out for delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancel = async (trackingId) => {
    const reason = window.prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return; // User clicked cancel
    
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`https://delivery-backend100.vercel.app/api/tracking/cancel/${trackingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Customer request' })
      });
      
      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'DELIVERED_ORDER_CANNOT_BE_CANCELLED') {
          toast.error('Cannot cancel delivered orders. Partner earnings are protected.');
        } else {
          throw new Error(data.message || 'Failed to cancel shipment');
        }
        return;
      }
      
      // Update the shipment status in the local state
      setShipments((prev) => 
        prev.map((s) => 
          s.trackingId === trackingId 
            ? { ...s, status: 'Cancelled', currentLocation: 'Cancelled' }
            : s
        )
      );
      
      toast.success('Order cancelled successfully');
      if (data.partnerEarningsProtected) {
        toast.info('Partial delivery charges may apply as order was already picked up.');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRefund = (shipment) => {
    setSelectedShipment(shipment);
    setShowRefundModal(true);
  };

  const handleComplaint = (shipment) => {
    setSelectedShipment(shipment);
    setShowComplaintModal(true);
  };

  const submitRefund = async (formData) => {
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`https://delivery-backend100.vercel.app/api/tracking/refund/${selectedShipment.trackingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request refund');
      }
      
      // Update the shipment refund status in the local state
      setShipments((prev) => 
        prev.map((s) => 
          s.trackingId === selectedShipment.trackingId 
            ? { ...s, payment: { ...s.payment, status: 'Refund Requested' } }
            : s
        )
      );
      
      toast.success('Refund request submitted successfully');
      toast.info('Your request is now under review. You will be notified once it is processed.');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const submitComplaint = async (complaintData) => {
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`https://delivery-backend100.vercel.app/api/tracking/complaint/${selectedShipment.trackingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaintData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit complaint');
      }
      
      toast.success('Detailed complaint submitted successfully');
      toast.info('Our support team will contact you within 24 hours.');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleCancelRefund = async (trackingId) => {
    const reason = window.prompt('Please provide a reason for cancelling the refund request (optional):');
    if (reason === null) return; // User clicked cancel
    
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`https://delivery-backend100.vercel.app/api/tracking/refund/cancel/${trackingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Customer cancelled refund request' })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel refund request');
      }
      
      // Update the shipment refund status in the local state
      setShipments((prev) => 
        prev.map((s) => 
          s.trackingId === trackingId 
            ? { ...s, payment: { ...s.payment, status: 'Completed' } }
            : s
        )
      );
      
      toast.success('Refund request cancelled successfully');
      toast.info('Your payment status has been restored to completed.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Debug: log all tracking IDs
  useEffect(() => {
    if (shipments.length > 0) {
      console.log('Shipments trackingIds:', shipments.map(s => s.trackingId));
    }
  }, [shipments]);

  // Skeleton Component with shimmer effect
  const ShipmentSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 animate-shimmer rounded"></div>
            <div>
              <div className="h-5 animate-shimmer rounded w-48 mb-2"></div>
              <div className="h-4 animate-shimmer rounded w-32"></div>
            </div>
          </div>
          <div className="h-6 animate-shimmer rounded-full w-20"></div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start">
              <div className="w-5 h-5 animate-shimmer rounded mt-0.5"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 animate-shimmer rounded w-24 mb-2"></div>
                <div className="h-5 animate-shimmer rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Status Skeleton */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 animate-shimmer rounded w-24 mb-2"></div>
              <div className="h-5 animate-shimmer rounded w-40"></div>
            </div>
            <div className="h-6 animate-shimmer rounded-full w-24"></div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex justify-end space-x-3">
          <div className="h-10 animate-shimmer rounded w-16"></div>
          <div className="h-10 animate-shimmer rounded w-24"></div>
          <div className="h-10 animate-shimmer rounded w-32"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 animate-shimmer rounded w-64 mb-2"></div>
              <div className="h-6 animate-shimmer rounded w-96"></div>
            </div>
            
            {/* Button Skeleton */}
            <div className="flex justify-end mb-6">
              <div className="h-10 animate-shimmer rounded w-48"></div>
            </div>

            {/* Shipments Skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <ShipmentSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-black mb-2">My Shipments</h1>
            <p className="text-gray-600 text-lg">Track and manage all your shipments in one place.</p>
          </div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => router.push('/create-shipment')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Create New Shipment
            </button>
          </div>
          {shipments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-black mb-2">No shipments found</h3>
              <p className="text-gray-500 mb-6">You haven't created any shipments yet.</p>
              <button
                onClick={() => router.push('/create-shipment')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Create New Shipment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {shipments.map((shipment) => {
                console.log('Shipment:', shipment);
                return (
                  <div key={shipment._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Package className="h-8 w-8 text-yellow-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-black">
                              Tracking ID: {shipment.trackingId}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Created {new Date(shipment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="ml-3">
                            <p className="text-sm text-gray-500">Current Location</p>
                            <p className="text-base font-medium text-black">{shipment.currentLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="ml-3">
                            <p className="text-sm text-gray-500">Destination</p>
                            <p className="text-base font-medium text-black">{shipment.destination}</p>
                          </div>
                        </div>
                        {shipment.packageDetails && (
                          <div className="flex items-start">
                            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm text-gray-500">Package Details</p>
                              <p className="text-base font-medium text-black">
                                {shipment.packageDetails.type} • {shipment.packageDetails.weight}kg
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Payment Status for delivered orders */}
                      {shipment.status.toLowerCase() === 'delivered' && shipment.payment && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Payment Status</p>
                              <p className="text-base font-medium text-black">
                                ₹{shipment.payment.amount} • {shipment.payment.method}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              shipment.payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              shipment.payment.status === 'Refunded' ? 'bg-blue-100 text-blue-800' :
                              shipment.payment.status === 'Refund Requested' ? 'bg-yellow-100 text-yellow-800' :
                              shipment.payment.status === 'Refund Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shipment.payment.status === 'Refund Requested' ? 'Under Review' : 
                               shipment.payment.status === 'Refunded' ? 'Refund Approved' : 
                               shipment.payment.status === 'Refund Rejected' ? 'Refund Rejected' :
                               shipment.payment.status}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => router.push(`/track-package?trackingId=${shipment.trackingId}`)}
                          className="px-6 py-2.5 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Track
                        </button>
                        
                        {/* Show cancel button only for non-delivered and non-cancelled orders */}
                        {shipment.status.toLowerCase() !== 'delivered' && 
                         shipment.status.toLowerCase() !== 'cancelled' && 
                         shipment.sender?.email === user?.email && (
                          <button
                            onClick={() => handleCancel(shipment.trackingId)}
                            className="px-6 py-2.5 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Cancel Order
                          </button>
                        )}

                        {/* Show refund button only for delivered orders */}
                        {shipment.status.toLowerCase() === 'delivered' && 
                         shipment.sender?.email === user?.email && 
                         shipment.payment?.status !== 'Refunded' && 
                         shipment.payment?.status !== 'Refund Requested' && 
                         shipment.payment?.status !== 'Refund Rejected' && (
                          <button
                            onClick={() => handleRefund(shipment)}
                            className="px-6 py-2.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Request Refund
                          </button>
                        )}

                        {/* Show complaint button for delivered orders */}
                        {shipment.status.toLowerCase() === 'delivered' && (
                          <button
                            onClick={() => handleComplaint(shipment)}
                            className="px-6 py-2.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Report Issue
                          </button>
                        )}

                        {/* Show refund status for refund requested orders with cancel option */}
                        {shipment.payment?.status === 'Refund Requested' && (
                          <div className="flex space-x-2">
                            <span className="px-6 py-2.5 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium">
                              Under Review
                            </span>
                            <button
                              onClick={() => handleCancelRefund(shipment.trackingId)}
                              className="px-4 py-2.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              title="Cancel your refund request"
                            >
                              Cancel Refund
                            </button>
                          </div>
                        )}

                        {/* Show refunded status */}
                        {shipment.payment?.status === 'Refunded' && (
                          <span className="px-6 py-2.5 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                            Refund Approved
                          </span>
                        )}

                        {/* Show rejected refund status */}
                        {shipment.payment?.status === 'Refund Rejected' && (
                          <span className="px-6 py-2.5 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                            Refund Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        shipment={selectedShipment}
        onRefundSubmit={submitRefund}
      />

      <ComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        shipment={selectedShipment}
        onComplaintSubmit={submitComplaint}
      />
    </div>
  );
}
