"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { toast } from 'react-toastify';
import EditableLocationCell from './EditableLocationCell';
import EditableStatusCell from './EditableStatusCell';
import AdminPageSkeleton from './AdminPageSkeleton';
import { 
  Package, 
  Search, 
  Eye, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Loader2 
} from 'lucide-react';

export default function AdminShipmentsTable() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Pagination and search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getRecentShipments();
      const list = Array.isArray(data) ? data : data.shipments || [];
      const regularShipments = list.filter(item => item.role !== 'admin');
      setShipments(regularShipments);
    } catch (err) {
      setError(err.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleStatusChange = async (trackingId, newStatus) => {
    const shipment = shipments.find(s => (s.trackingId || s.id) === trackingId);
    if (!shipment) {
      toast.error('Shipment not found');
      return;
    }
    
    const originalStatus = shipment.status;
    const currentLocation = shipment.currentLocation;
    
    // Optimistically update local state
    setShipments(prev => prev.map(s =>
      (s.trackingId || s.id) === trackingId ? { ...s, status: newStatus } : s
    ));
    setUpdatingId(trackingId);
    
    try {
      await adminService.updateTrackingStatus(trackingId, newStatus, currentLocation);
      toast.success('Status updated successfully');
      
      const updatedShipments = await adminService.getRecentShipments();
      setShipments(Array.isArray(updatedShipments) ? updatedShipments : updatedShipments.shipments || []);
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error(err.message || 'Failed to update status');
      
      // Rollback
      setShipments(prev => prev.map(s =>
        (s.trackingId || s.id) === trackingId ? { ...s, status: originalStatus } : s
      ));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveLocation = async (trackingId, newLocation, shipment) => {
    try {
      setUpdatingId(trackingId);
      const status = shipment.status;
      setShipments(prev => prev.map(s =>
        (s.trackingId || s.id) === trackingId ? { ...s, currentLocation: newLocation } : s
      ));

      await adminService.updateTrackingStatus(trackingId, status, newLocation);
      toast.success('Location checkpoint updated');
      const updatedShipments = await adminService.getRecentShipments();
      setShipments(Array.isArray(updatedShipments) ? updatedShipments : updatedShipments.shipments || []);
    } catch (err) {
      toast.error('Failed to update location');
      fetchShipments();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredShipments = shipments.filter(s => {
    const term = search.toLowerCase();
    const tracking = (s.trackingId || s.id || '').toLowerCase();
    const customer = (s.customer || s.sender?.name || s.receiver?.name || '').toLowerCase();
    const loc = (s.currentLocation || s.origin || s.destination || '').toLowerCase();
    return tracking.includes(term) || customer.includes(term) || loc.includes(term);
  });

  const totalPages = Math.ceil(filteredShipments.length / pageSize);
  const paginatedShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  if (loading && shipments.length === 0) {
    return <AdminPageSkeleton title="Shipments" showCards={false} showCharts={false} tableRows={8} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-2">
              <Package className="w-3.5 h-3.5 text-teal-600" />
              <span>Consignment Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              All Shipments
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Live tracking directory, checkpoint editing, and consignment inspection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchShipments}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/admin/create-shipment')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Book New Shipment
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Tracking ID, customer, city..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end">
            <span>
              Showing {paginatedShipments.length} of {filteredShipments.length}
            </span>
            <div className="flex items-center gap-1.5 ml-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline" /> Prev
              </button>
              <span className="font-semibold text-slate-800 px-2">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
              >
                Next <ChevronRight className="w-3.5 h-3.5 inline" />
              </button>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3.5 text-left">Tracking ID</th>
                  <th className="px-6 py-3.5 text-left">Consignor / Customer</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Current Location</th>
                  <th className="px-6 py-3.5 text-left">Origin → Destination</th>
                  <th className="px-6 py-3.5 text-left">Booked Date</th>
                  <th className="px-6 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedShipments.map((shipment) => {
                  const sId = shipment.trackingId || shipment.id;
                  const isUpdating = updatingId === sId;

                  return (
                    <tr key={sId} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-900">
                        {sId}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block text-xs">
                          {shipment.customer || shipment.sender?.name || '-'}
                        </span>
                        <span className="text-slate-600 font-medium text-[11px] block mt-0.5">
                          {shipment.receiver?.name ? `To: ${shipment.receiver.name}` : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <EditableStatusCell
                          value={shipment.status}
                          disabled={isUpdating}
                          onSave={newStatus => handleStatusChange(sId, newStatus)}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-medium">
                        <div className="flex items-center gap-1.5">
                          <EditableLocationCell
                            value={shipment.currentLocation ?? ''}
                            disabled={isUpdating}
                            onSave={newLocation => handleSaveLocation(sId, newLocation, shipment)}
                          />
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-medium max-w-xs truncate">
                        {shipment.origin} <span className="text-slate-500 font-bold">→</span> {shipment.destination}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-semibold text-[11px]">
                        {shipment.date ? new Date(shipment.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => router.push(`/admin/shipments/${sId}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-700 font-semibold text-xs transition"
                          title="View Full Consignment Specifications"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}