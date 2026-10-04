'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { API_URL } from '../../../services/api.config.js';
import { toast } from 'react-toastify';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedPartners, setSelectedPartners] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadPartners();
  }, [filters]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const response = await fetch(`${API_URL}/admin/partners?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setPartners(data.partners || []);
        setPagination(data.pagination || {});
      } else {
        setError(data.message || 'Failed to load delivery partners');
      }
    } catch (err) {
      console.error('Load partners error:', err);
      setError('Unable to reach server. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (partnerId, newStatus) => {
    try {
      setActionLoadingId(partnerId);
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
        loadPartners();
      } else {
        toast.error(data.message || 'Failed to update partner status');
      }
    } catch (err) {
      console.error('Update partner status error:', err);
      toast.error('Network error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSelectPartner = (partnerId) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPartners.length === partners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(partners.map(p => p._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPartners.length === 0) {
      toast.error('Please select at least one partner');
      return;
    }

    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/admin/partners/bulk-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          partnerIds: selectedPartners
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Updated ${selectedPartners.length} partner(s) to ${action}`);
        setSelectedPartners([]);
        loadPartners();
      } else {
        toast.error(data.message || 'Bulk action failed');
      }
    } catch (err) {
      toast.error('Failed to perform bulk action');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Pending
          </span>
        );
    }
  };

  const inputStyle = "px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition shadow-2xs";

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-2">
              <Truck className="w-3.5 h-3.5 text-teal-600" />
              <span>Fleet & Partner Network</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Delivery Partners
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Verify driver documents, review performance stats, and manage dispatch authorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadPartners}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Error Loading Partners</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                placeholder="Search by driver name, email, or vehicle RC..."
                className={`${inputStyle} w-full pl-10`}
              />
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className={`${inputStyle} w-full`}
              >
                <option value="">All Verification Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved & Verified</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className={`${inputStyle} w-full`}
              >
                <option value="10">Show 10 per page</option>
                <option value="25">Show 25 per page</option>
                <option value="50">Show 50 per page</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedPartners.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50 p-3 rounded-xl">
              <span className="text-xs font-semibold text-slate-700">
                {selectedPartners.length} driver(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('approved')}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkAction('rejected')}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Reject Selected
                </button>
                <button
                  onClick={() => handleBulkAction('suspended')}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition"
                >
                  Suspend Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Registered Drivers ({pagination.totalRecords || partners.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-800 mx-auto mb-3" />
              <p className="text-xs text-slate-700 font-semibold">Fetching partner fleet...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No Partners Found</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">Try changing filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-3.5 text-left w-10">
                      <input
                        type="checkbox"
                        checked={partners.length > 0 && selectedPartners.length === partners.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-400 text-slate-900 focus:ring-slate-900"
                      />
                    </th>
                    <th className="px-6 py-3.5 text-left">Partner Info</th>
                    <th className="px-6 py-3.5 text-left">Vehicle & RC</th>
                    <th className="px-6 py-3.5 text-left">Verification Status</th>
                    <th className="px-6 py-3.5 text-left">Performance</th>
                    <th className="px-6 py-3.5 text-left">Registration Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map((partner) => (
                    <tr key={partner._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPartners.includes(partner._id)}
                          onChange={() => handleSelectPartner(partner._id)}
                          className="rounded border-slate-400 text-slate-900 focus:ring-slate-900"
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {partner.name}
                            {partner.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600" title="Online" />
                            )}
                          </div>
                          <div className="text-slate-700 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-slate-600" />
                            {partner.email}
                          </div>
                          <div className="text-slate-700 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            {partner.phone}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="font-bold text-slate-900 capitalize block">
                            {partner.vehicleType || 'Bike'}
                          </span>
                          <span className="font-mono text-slate-800 text-xs font-semibold block mt-0.5">
                            {partner.vehicleNumber || 'No RC'}
                          </span>
                          <span className="text-slate-600 font-medium text-[11px] block mt-0.5">
                            Exp: {partner.experience || '0-1'} yrs
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(partner.status)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">
                            {partner.totalDeliveries || 0} deliveries
                          </div>
                          <div className="text-emerald-700 font-extrabold">
                            ₹{(partner.totalEarnings || 0).toLocaleString()}
                          </div>
                          <div className="text-amber-700 font-bold text-xs">
                            ★ {partner.rating ? partner.rating.toFixed(1) : '5.0'} / 5.0
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-xs font-medium">
                        {new Date(partner.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Dedicated View Screen Button */}
                          <button
                            onClick={() => router.push(`/admin/partners/${partner._id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-700 font-semibold text-xs transition"
                            title="View Full Profile & Verification"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>

                          {partner.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(partner._id, 'approved')}
                                disabled={actionLoadingId === partner._id}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(partner._id, 'rejected')}
                                disabled={actionLoadingId === partner._id}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {partner.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(partner._id, 'suspended')}
                              disabled={actionLoadingId === partner._id}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 font-semibold text-xs transition disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                Page {pagination.currentPage || 1} of {pagination.totalPages} ({pagination.totalRecords} total partners)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.currentPage <= 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4 inline" /> Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}