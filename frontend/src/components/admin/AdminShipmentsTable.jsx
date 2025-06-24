"use client";
import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import toast from 'react-hot-toast';
import EditableLocationCell from './EditableLocationCell';
import EditableStatusCell from './EditableStatusCell';
import AdminPageSkeleton from './AdminPageSkeleton';

export default function AdminShipmentsTable() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [editLocations, setEditLocations] = useState({});
  const [editingLocationId, setEditingLocationId] = useState(null);
  // Pagination and search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await adminService.getRecentShipments();
        const regularUsers = data.filter(user => user.role !== 'admin');
        setShipments(regularUsers);
      } catch (err) {
        setError(err.message || 'Failed to fetch shipments');
      } finally {
        setLoading(false);
      }
    };
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
    
    console.log('Updating status for:', trackingId, 'from', originalStatus, 'to', newStatus);
    
    // Optimistically update local state
    setShipments(prev => prev.map(s =>
      (s.trackingId || s.id) === trackingId ? { ...s, status: newStatus } : s
    ));
    setUpdatingId(trackingId);
    
    try {
      const result = await adminService.updateTrackingStatus(trackingId, newStatus, currentLocation);
      console.log('Status update successful:', result);
      toast.success('Status updated successfully');
      
      // Refresh the shipments list to ensure we have the latest data
      const updatedShipments = await adminService.getRecentShipments();
      setShipments(Array.isArray(updatedShipments) ? updatedShipments : updatedShipments.shipments || []);
      
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error(err.message || 'Failed to update status');
      
      // Rollback to original status
      setShipments(prev => prev.map(s =>
        (s.trackingId || s.id) === trackingId ? { ...s, status: originalStatus } : s
      ));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLocationChange = (trackingId, newLocation) => {
    setEditLocations(prev => ({ ...prev, [trackingId]: newLocation }));
  };

  const handleEditLocation = (trackingId, currentLocation) => {
    setEditingLocationId(trackingId);
    setEditLocations(prev => ({ ...prev, [trackingId]: currentLocation }));
  };

  const handleCancelEdit = (trackingId) => {
    setEditingLocationId(null);
    setEditLocations(prev => ({ ...prev, [trackingId]: undefined }));
      setEditingLocationId(null);
  };

  // New handler for EditableLocationCell
  const handleSaveLocation = async (trackingId, newLocation, shipment) => {
    try {
      setUpdatingId(trackingId);
      const status = shipment.status;
      // Optimistically update local state
      setShipments(prev => prev.map(s =>
        (s.trackingId || s.id) === trackingId ? { ...s, currentLocation: newLocation } : s
      ));
      try {
        await adminService.updateTrackingStatus(trackingId, status, newLocation);
        toast.success('Location updated');
      } catch (err) {
        toast.error(err.message || 'Failed to update location');
        // Rollback optimistic update
        setShipments(prev => prev.map(s =>
          (s.trackingId || s.id) === trackingId ? { ...s, currentLocation: shipment.currentLocation } : s
        ));
      }
      // Refresh the shipments list in the background
      const data = await adminService.getRecentShipments();
      setShipments(Array.isArray(data) ? data : data.shipments || []);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <AdminPageSkeleton title="Shipments" showCards={false} showCharts={false} tableRows={10} />;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Filter and paginate
  const filteredShipments = shipments.filter(s =>
    (s.trackingId || s.id)?.toLowerCase().includes(search.toLowerCase()) ||
    (s.customer || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.currentLocation || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredShipments.length / pageSize);
  const paginatedShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-black mb-2">All Shipments</h1>
          <p className="text-gray-600 text-lg">View and manage all recent shipments in the system.</p>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Tracking ID, Customer, or Location"
            className="border border-black px-3 py-2 rounded w-64 text-black bg-white"
          />
          <div className="flex-1" />
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 text-black border border-black disabled:opacity-50"
          >Prev</button>
          <span className="mx-2 text-black">Page {page} of {totalPages || 1}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 rounded bg-gray-200 text-black border border-black disabled:opacity-50"
          >Next</button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tracking ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Current Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedShipments.map((shipment, idx) => (
                <tr key={shipment.trackingId || shipment.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{shipment.trackingId || shipment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{shipment.customer || shipment.sender?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableStatusCell
                      value={shipment.status}
                      disabled={updatingId === (shipment.trackingId || shipment.id)}
                      onSave={newStatus => handleStatusChange(shipment.trackingId || shipment.id, newStatus)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <EditableLocationCell
                      value={shipment.currentLocation ?? ''}
                      disabled={updatingId === (shipment.trackingId || shipment.id)}
                      onSave={newLocation => handleSaveLocation(shipment.trackingId || shipment.id, newLocation, shipment)}
                    />
                    {updatingId === (shipment.trackingId || shipment.id) && (
                      <span className="ml-2 animate-spin text-amber-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{shipment.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{shipment.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{shipment.date ? new Date(shipment.date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 