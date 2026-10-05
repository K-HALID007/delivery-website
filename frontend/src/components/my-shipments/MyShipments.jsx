'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  FileText,
  RotateCcw
} from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';
import RefundModal from '@/components/modals/RefundModal';
import ComplaintModal from '@/components/modals/ComplaintModal';
import { API_URL } from '@/services/api.config';

export default function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = sessionStorage.getItem('user_token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch(`${API_URL}/tracking/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch shipments');
        }

        const data = await response.json();
        setShipments(Array.isArray(data) ? data : data.shipments || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve shipments');
      } finally {
        setLoading(false);
      }
    };

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchShipments();
  }, [router]);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Tracking ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Delivered'
        };
      case 'in transit':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500 animate-pulse',
          label: 'In Transit'
        };
      case 'out for delivery':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Out for Delivery'
        };
      case 'pending':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Pending Ingestion'
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status || 'Processing'
        };
    }
  };

  const handleCancel = async (trackingId) => {
    const reason = window.prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return;
    
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/tracking/cancel/${trackingId}`, {
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
      const response = await fetch(`${API_URL}/tracking/refund/${selectedShipment.trackingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request refund');
      }
      
      setShipments((prev) => 
        prev.map((s) => 
          s.trackingId === selectedShipment.trackingId 
            ? { ...s, payment: { ...s.payment, status: 'Refund Requested' } }
            : s
        )
      );
      
      setShowRefundModal(false);
      setSelectedShipment(null);
      toast.success('Refund request submitted successfully');
      toast.info('Our dispatch support team will review the request within 24 hours.');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const submitComplaint = async (complaintData) => {
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/tracking/complaint/${selectedShipment.trackingId}`, {
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
      
      toast.success('Issue report submitted successfully');
      toast.info('Our customer support team will investigate and contact you.');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleCancelRefund = async (trackingId) => {
    const reason = window.prompt('Please provide a reason for cancelling the refund request (optional):');
    if (reason === null) return;
    
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/tracking/refund/cancel/${trackingId}`, {
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
      
      setShipments((prev) => 
        prev.map((s) => 
          s.trackingId === trackingId 
            ? { ...s, payment: { ...s.payment, status: 'Completed' } }
            : s
        )
      );
      
      toast.success('Refund request cancelled successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Filter shipments based on tab & search query
  const filteredShipments = shipments.filter((s) => {
    const matchTab = 
      activeTab === 'all' ? true :
      activeTab === 'active' ? ['in transit', 'out for delivery', 'pending'].includes(s.status?.toLowerCase()) :
      activeTab === 'delivered' ? s.status?.toLowerCase() === 'delivered' :
      activeTab === 'cancelled' ? s.status?.toLowerCase() === 'cancelled' : true;

    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q ? true :
      s.trackingId?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.currentLocation?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q);

    return matchTab && matchQuery;
  });

  const totalCount = shipments.length;
  const activeCount = shipments.filter(s => ['in transit', 'out for delivery', 'pending'].includes(s.status?.toLowerCase())).length;
  const deliveredCount = shipments.filter(s => s.status?.toLowerCase() === 'delivered').length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full flex-1">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-2">
              <Package className="w-3.5 h-3.5 text-slate-600" />
              <span>Consignment Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Shipments
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track live dispatch milestones, monitor payments, and manage booking requests in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/create-shipment')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              <span>Book New Courier</span>
            </button>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Consignments</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active In-Transit</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">{activeCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Successfully Delivered</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{deliveredCount}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Orders', count: totalCount },
              { id: 'active', label: 'In Transit', count: activeCount },
              { id: 'delivered', label: 'Delivered', count: deliveredCount },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-teal-700 text-white' : 'bg-slate-200/70 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, destination, hub..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="h-12 bg-slate-50 rounded"></div>
                  <div className="h-12 bg-slate-50 rounded"></div>
                  <div className="h-12 bg-slate-50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load shipments</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No consignments found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'No packages matched your search query. Try clearing filters.' 
                : 'You have not scheduled any delivery shipments yet.'}
            </p>
            <div className="mt-5">
              <button
                onClick={() => router.push('/create-shipment')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Book Your First Shipment
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShipments.map((shipment) => {
              const badge = getStatusBadge(shipment.status);
              return (
                <div
                  key={shipment._id || shipment.trackingId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition duration-200 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* Header: Tracking ID + Status + Creation Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="min-w-0 break-all font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                              {shipment.trackingId}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(shipment.trackingId)}
                              title="Copy Tracking ID"
                              className="text-slate-400 hover:text-slate-700 transition"
                            >
                              {copiedId === shipment.trackingId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Booked on {new Date(shipment.createdAt || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    {/* Routing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      {/* Current Location */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Current Location
                        </span>
                        <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-900">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{shipment.currentLocation || 'In Transit Corridor'}</span>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Destination
                        </span>
                        <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-900">
                          <Truck className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{shipment.destination || 'Unassigned Destination'}</span>
                        </div>
                      </div>

                      {/* Specifications */}
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Parcel Details
                        </span>
                        <div className="text-xs font-semibold text-slate-900">
                          {shipment.packageDetails ? (
                            <span className="capitalize">
                              {shipment.packageDetails.type || 'Standard'} • {shipment.packageDetails.weight || 1} kg
                            </span>
                          ) : (
                            <span>Standard Consignment</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Info if Available */}
                    {shipment.payment && (
                      <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">Payment:</span>
                          <span className="font-bold text-slate-900">₹{shipment.payment.amount || 0}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 uppercase">{shipment.payment.method || 'Online'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          shipment.payment.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          shipment.payment.status === 'Refund Requested' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          shipment.payment.status === 'Refunded' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {shipment.payment.status === 'Refund Requested' ? 'Refund Under Review' : shipment.payment.status}
                        </span>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* Cancel Button (only for non-delivered, non-cancelled) */}
                        {shipment.status?.toLowerCase() !== 'delivered' &&
                         shipment.status?.toLowerCase() !== 'cancelled' &&
                         shipment.sender?.email === user?.email && (
                          <button
                            type="button"
                            onClick={() => handleCancel(shipment.trackingId)}
                            className="px-3 py-1.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition"
                          >
                            Cancel Consignment
                          </button>
                        )}

                        {/* Refund Button for delivered */}
                        {shipment.status?.toLowerCase() === 'delivered' &&
                         shipment.sender?.email === user?.email &&
                         shipment.payment?.status !== 'Refunded' &&
                         shipment.payment?.status !== 'Refund Requested' && (
                          <button
                            type="button"
                            onClick={() => handleRefund(shipment)}
                            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            Request Refund
                          </button>
                        )}

                        {/* Complaint Button for delivered */}
                        {shipment.status?.toLowerCase() === 'delivered' && (
                          <button
                            type="button"
                            onClick={() => handleComplaint(shipment)}
                            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            Report Issue
                          </button>
                        )}

                        {/* Cancel Refund Button if Under Review */}
                        {shipment.payment?.status === 'Refund Requested' && (
                          <button
                            type="button"
                            onClick={() => handleCancelRefund(shipment.trackingId)}
                            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition"
                          >
                            Cancel Refund Request
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/track-package?trackingId=${shipment.trackingId}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap"
                      >
                        <span>Live Telemetry</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

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
