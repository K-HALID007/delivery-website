'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../services/api.config.js';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPartners();
  }, [filters]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
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
        setPartners(data.partners);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to load partners');
      }
    } catch (error) {
      setError('Failed to load partners');
      console.error('Load partners error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (partnerId, newStatus, notes = '') => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/partners/${partnerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Reload partners list
        loadPartners();
        alert(`Partner status updated to ${newStatus}`);
      } else {
        alert(data.message || 'Failed to update partner status');
      }
    } catch (error) {
      alert('Failed to update partner status');
      console.error('Update partner status error:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPartners.length === 0) {
      alert('Please select partners first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedPartners.length} partner(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/partners/bulk-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partnerIds: selectedPartners,
          action,
          data: { status: action }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        loadPartners();
        setSelectedPartners([]);
        setShowBulkActions(false);
        alert(`Bulk action completed: ${data.modifiedCount} partners updated`);
      } else {
        alert(data.message || 'Bulk action failed');
      }
    } catch (error) {
      alert('Bulk action failed');
      console.error('Bulk action error:', error);
    }
  };

  const handleSelectPartner = (partnerId) => {
    setSelectedPartners(prev => {
      const newSelection = prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedPartners.length === partners.length) {
      setSelectedPartners([]);
      setShowBulkActions(false);
    } else {
      setSelectedPartners(partners.map(p => p._id));
      setShowBulkActions(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'suspended': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-gray-600 mt-2">Manage delivery partners and their applications</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Partners
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Search by name, email, or vehicle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                {selectedPartners.length} partner(s) selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleBulkAction('approved')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkAction('rejected')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject Selected
                </button>
                <button
                  onClick={() => handleBulkAction('suspended')}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                >
                  Suspend Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Partners Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Partners ({pagination.totalRecords || 0})
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading partners...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No partners found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPartners.length === partners.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partner Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partners.map((partner) => (
                    <tr key={partner._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPartners.includes(partner._id)}
                          onChange={() => handleSelectPartner(partner._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                          <div className="text-sm text-gray-500">{partner.email}</div>
                          <div className="text-sm text-gray-500">{partner.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 capitalize">{partner.vehicleType}</div>
                          <div className="text-sm text-gray-500">{partner.vehicleNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                          {partner.status.toUpperCase()}
                        </span>
                        {partner.isOnline && partner.status === 'approved' && (
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            <span className="text-xs text-green-600">Online</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>Deliveries: {partner.totalDeliveries || 0}</div>
                          <div>Rating: {partner.rating || 0}/5</div>
                          <div className="text-green-600">₹{partner.totalEarnings || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(partner.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/partners/${partner._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          {partner.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(partner._id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(partner._id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {partner.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(partner._id, 'suspended')}
                              className="text-orange-600 hover:text-orange-900"
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

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current - 1) * filters.limit) + 1} to{' '}
                  {Math.min(pagination.current * filters.limit, pagination.totalRecords)} of{' '}
                  {pagination.totalRecords} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.current - 1 })}
                    disabled={pagination.current <= 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.current - 2) + i;
                    if (pageNum > pagination.total) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters({ ...filters, page: pageNum })}
                        className={`px-3 py-1 border rounded text-sm ${
                          pageNum === pagination.current
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.current + 1 })}
                    disabled={pagination.current >= pagination.total}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}