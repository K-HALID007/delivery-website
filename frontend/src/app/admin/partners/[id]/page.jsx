'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  Award, 
  Package, 
  Calendar,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PartnerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params?.id;

  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`${API_URL}/admin/partners/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPartner(data.partner);
        setStats(data.stats || {});
        setRecentDeliveries(data.recentDeliveries || []);
      } else {
        setError(data.message || 'Failed to load partner details');
      }
    } catch (err) {
      console.error('Error fetching partner details:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartnerDetails();
    }
  }, [partnerId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');

      const response = await fetch(`${API_URL}/admin/partners/${partnerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Partner status updated to ${newStatus.toUpperCase()}`);
        setPartner(prev => ({ ...prev, status: newStatus }));
      } else {
        toast.error(data.message || 'Failed to update partner status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Approved & Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-300">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Pending Approval
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading partner profile...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-300 p-8 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Partner Record Not Found</h2>
          <p className="text-slate-700 text-sm mb-6">{error || 'The requested partner ID does not exist.'}</p>
          <button
            onClick={() => router.push('/admin/partners')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/partners')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 mb-2 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              Back to All Partners
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {partner.name}
              </h1>
              {getStatusBadge(partner.status)}
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Registered on {new Date(partner.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} • ID: <span className="font-mono font-bold text-slate-800">{partner._id}</span>
            </p>
          </div>

          {/* Action Approval Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {partner.status !== 'approved' && (
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Driver
              </button>
            )}

            {partner.status !== 'rejected' && partner.status !== 'approved' && (
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject Application
              </button>
            )}

            {partner.status === 'approved' && (
              <button
                onClick={() => handleStatusUpdate('suspended')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                Suspend Account
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Completed Trips
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.completedDeliveries ?? partner.totalDeliveries ?? 0}
              </span>
              <span className="text-xs font-bold text-emerald-700">delivered</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Total Earnings
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{(stats.totalEarnings ?? partner.totalEarnings ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-600">payouts</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Customer Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.avgRating ? stats.avgRating.toFixed(1) : (partner.rating || 5.0)}
              </span>
              <span className="text-xs font-bold text-amber-600">★ out of 5.0</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Live Fleet Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${partner.isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-sm font-bold text-slate-900">
                {partner.isOnline ? 'Online & Available' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal & Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-slate-700" />
                Contact & Identity
              </h2>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Full Legal Name</span>
                  <span className="text-slate-900 font-bold text-sm">{partner.name}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Email Address</span>
                  <a href={`mailto:${partner.email}`} className="text-slate-900 hover:text-amber-700 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    {partner.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Contact Phone Number</span>
                  <a href={`tel:${partner.phone}`} className="text-slate-900 hover:text-amber-700 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    {partner.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-slate-700" />
                Operating Address & Hub
              </h2>
              <div className="text-xs text-slate-800 space-y-1">
                <p className="font-semibold text-slate-900">{partner.address?.street || 'Not provided'}</p>
                <p className="font-medium text-slate-700">{partner.address?.city}, {partner.address?.state} {partner.address?.postalCode}</p>
                <p className="font-medium text-slate-700">{partner.address?.country || 'India'}</p>
                {partner.preferredZones && (
                  <p className="mt-2 text-slate-700 font-medium">
                    <strong className="text-slate-900">Preferred Hub Zones:</strong> {partner.preferredZones}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-slate-700" />
                Banking & Payout Setup
              </h2>
              <div className="text-xs space-y-2.5">
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Bank Account Number</span>
                  <span className="font-mono text-slate-900 font-bold text-sm">
                    {partner.bankAccount ? `•••• •••• ${partner.bankAccount.slice(-4)}` : 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Bank IFSC Code</span>
                  <span className="font-mono text-slate-900 font-bold text-sm">{partner.ifscCode || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Vehicle & Documents + Recent Deliveries */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle & KYC Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-slate-700" />
                Vehicle & Verification Specs
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Vehicle Category</span>
                  <span className="text-slate-900 font-extrabold capitalize text-sm">{partner.vehicleType || 'Bike'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Vehicle RC No.</span>
                  <span className="text-slate-900 font-mono font-extrabold text-sm">{partner.vehicleNumber || '-'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Driving License</span>
                  <span className="text-slate-900 font-mono font-extrabold text-sm">{partner.licenseNumber || '-'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Experience Level</span>
                  <span className="text-slate-900 font-extrabold text-sm">{partner.experience || '0-1'} Years</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Preferred Shift: <strong className="capitalize text-slate-900">{partner.workingHours || 'Flexible'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KYC Compliant</span>
                </div>
              </div>
            </div>

            {/* Recent Deliveries Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-700" />
                  Assigned Delivery History
                </h2>
                <span className="text-xs text-slate-600 font-bold">
                  {recentDeliveries.length} records shown
                </span>
              </div>

              {recentDeliveries.length === 0 ? (
                <div className="text-center py-8 text-slate-600 font-medium text-xs">
                  No active or historical deliveries assigned to this driver yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead>
                      <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px] bg-slate-50/80">
                        <th className="py-2.5 px-3 text-left">Tracking ID</th>
                        <th className="py-2.5 px-3 text-left">Status</th>
                        <th className="py-2.5 px-3 text-left">Origin → Destination</th>
                        <th className="py-2.5 px-3 text-right">Earning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentDeliveries.map((del) => (
                        <tr key={del._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {del.trackingId}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {del.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-xs">
                            {del.origin} → {del.destination}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            ₹{del.partnerEarnings || 40}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
