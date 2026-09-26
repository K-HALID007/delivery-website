'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react';
import { API_URL } from '@/services/api.config.js';
import { toast } from 'react-toastify';

export default function AdminShipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params?.trackingId;

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const fetchShipment = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_URL}/tracking/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId })
      });

      const data = await res.json();
      if (res.ok && data.success && data.shipment) {
        setShipment(data.shipment);
        setNewStatus(data.shipment.status || 'Pending');
        setNewLocation(data.shipment.currentLocation || '');
      } else {
        setError(data.message || 'Shipment not found');
      }
    } catch (err) {
      console.error('Fetch shipment error:', err);
      setError('Unable to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      fetchShipment();
    }
  }, [trackingId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      
      const res = await fetch(`${API_URL}/tracking/${trackingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          currentLocation: newLocation
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Shipment updated successfully');
        setShipment(prev => ({
          ...prev,
          status: newStatus,
          currentLocation: newLocation
        }));
      } else {
        toast.error(data.message || 'Failed to update shipment');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Network error during update');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
      case 'in transit':
      case 'in_transit':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">In Transit</span>;
      case 'out for delivery':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Out for Delivery</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{status || 'Pending'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading shipment specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Shipment Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'Invalid or missing tracking record.'}</p>
          <button
            onClick={() => router.push('/admin/shipments')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/shipments')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shipments Table
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {shipment.trackingId}
              </h1>
              {getStatusBadge(shipment.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created on {new Date(shipment.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick Update Console */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 flex-shrink-0">
                <Truck className="w-5 h-5 text-slate-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Live Status & Checkpoint Update</p>
                <p className="text-xs text-slate-600 font-medium">Changes reflect immediately on customer tracking console</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="Pending">Pending Pickup</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Current Location / Hub..."
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 min-w-[200px]"
              />

              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Updates
              </button>
            </div>
          </form>
        </div>

        {/* 2-Column Consignment Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Origin & Sender */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <User className="w-4 h-4 text-slate-700" />
                Sender (Pickup Consignor)
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">Origin</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Full Name</span>
                <span className="text-slate-900 font-bold text-sm">{shipment.sender?.name || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Phone</span>
                  <span className="text-slate-900 font-semibold">{shipment.sender?.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Email</span>
                  <span className="text-slate-900 font-semibold">{shipment.sender?.email || '-'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Pickup Street Address</span>
                <span className="text-slate-900 font-semibold">{shipment.origin || '-'}</span>
              </div>
            </div>
          </div>

          {/* Right: Destination & Receiver */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <MapPin className="w-4 h-4 text-amber-600" />
                Receiver (Delivery Consignee)
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300">Destination</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Recipient Full Name</span>
                <span className="text-slate-900 font-bold text-sm">{shipment.receiver?.name || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Phone</span>
                  <span className="text-slate-900 font-semibold">{shipment.receiver?.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Email</span>
                  <span className="text-slate-900 font-semibold">{shipment.receiver?.email || '-'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-0.5">Delivery Street Address</span>
                <span className="text-slate-900 font-semibold">{shipment.destination || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Specifications & Payment Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-700" />
            Consignment Specs & Freight Details
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Service Type</span>
              <span className="text-slate-900 font-extrabold capitalize text-sm">{shipment.packageDetails?.type || 'Standard'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Package Weight</span>
              <span className="text-slate-900 font-extrabold text-sm">{shipment.packageDetails?.weight || 1} KG</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Payment Method</span>
              <span className="text-slate-900 font-extrabold text-sm uppercase">{shipment.payment?.method || 'COD'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block mb-1">Current Checkpoint</span>
              <span className="text-slate-900 font-bold text-sm">{shipment.currentLocation || 'Origin Facility'}</span>
            </div>
          </div>

          {shipment.packageDetails?.description && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-1">Contents Description:</span>
              <p className="text-slate-900 font-medium">{shipment.packageDetails.description}</p>
            </div>
          )}

          {shipment.packageDetails?.specialInstructions && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-1">Special Handling Instructions:</span>
              <p className="text-slate-900 font-medium italic">{shipment.packageDetails.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
