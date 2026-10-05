"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  History, 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building,
  Navigation
} from 'lucide-react';
import { trackingService } from '@/services/tracking.service';
import { toast } from 'react-toastify';
import Link from 'next/link';

const milestoneSteps = [
  { id: 'booked', label: 'Order Booked', icon: Package },
  { id: 'hub', label: 'Hub Ingestion', icon: Building },
  { id: 'transit', label: 'In Transit', icon: Truck },
  { id: 'out', label: 'Out for Delivery', icon: Navigation },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

const Tracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const performTracking = async (idToTrack) => {
    const id = (idToTrack || trackingId).trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      let attempts = 0;
      let lastError = null;
      let data = null;
      
      while (attempts < 3) {
        try {
          data = await trackingService.trackPackage(id);
          break;
        } catch (err) {
          lastError = err;
          if (err.message === 'Tracking ID not found') {
            attempts++;
            if (attempts < 3) {
              await new Promise(res => setTimeout(res, 800));
            }
          } else {
            throw err;
          }
        }
      }
      if (!data && lastError) throw lastError;
      
      setTrackingData(data);
    } catch (err) {
      setError(err.message || 'No shipment found with this tracking ID. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    if (e) e.preventDefault();
    performTracking(trackingId);
  };

  const handleSampleClick = (sampleId) => {
    setTrackingId(sampleId);
    performTracking(sampleId);
  };

  // Pre-fill trackingId from URL and auto-track if present
  useEffect(() => {
    const urlTrackingId = searchParams.get('trackingId');
    if (urlTrackingId) {
      setTrackingId(urlTrackingId);
      performTracking(urlTrackingId);
      router.replace('/track-package');
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const copyId = () => {
    if (!trackingData?.trackingId) return;
    navigator.clipboard.writeText(trackingData.trackingId);
    setCopied(true);
    toast.success('Tracking ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine current active milestone index (0 to 4)
  const getActiveMilestoneIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') && !s.includes('out')) return 4;
    if (s.includes('out')) return 3;
    if (s.includes('transit')) return 2;
    if (s.includes('hub') || s.includes('sort')) return 1;
    return 0; // Booked / Pending
  };

  const currentMilestoneIndex = trackingData ? getActiveMilestoneIndex(trackingData.status) : 0;

  return (
    <div className="w-full bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-140px)]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-Time Satellite Dispatch Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Consignment
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Instant live telemetry, estimated arrival dates, and checkpoint timeline for any parcel.
          </p>
        </div>

        {/* Search Console Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-8">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter Tracking ID (e.g. TRK-DEL-89210)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono text-sm transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locating Package...</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Tracking Assistance Note */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Enter your standard tracking code from your receipt or SMS dispatch notification</span>
            </span>
            <span className="text-slate-500 font-medium">Active Telemetry Stream</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="text-sm font-semibold">Consignment Not Found</p>
              <p className="text-xs mt-0.5 text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Shimmer Skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-pulse space-y-6">
            <div className="h-6 bg-slate-100 rounded w-1/3"></div>
            <div className="h-10 bg-slate-50 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-50 rounded"></div>
              <div className="h-20 bg-slate-50 rounded"></div>
            </div>
          </div>
        )}

        {/* Tracking Information Display */}
        {trackingData && !loading && (
          <div className="space-y-6">
            
            {/* Primary Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              
              {/* Top Bar: Tracking ID + Status Pill */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Waybill Number
                  </span>
                  <div className="flex items-center gap-2 mt-1 min-w-0">
                    <span className="min-w-0 break-all font-mono text-base sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {trackingData.trackingId}
                    </span>
                    <button
                      type="button"
                      onClick={copyId}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                      title="Copy Tracking ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                    trackingData.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : trackingData.status === 'In Transit'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : trackingData.status === 'Out for Delivery'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      trackingData.status === 'Delivered'
                        ? 'bg-emerald-500'
                        : 'bg-current animate-pulse'
                    }`} />
                    <span>{trackingData.status}</span>
                  </div>
                </div>
              </div>

              {/* Visual 5-Step Milestone Progress Bar */}
              <div className="py-8 border-b border-slate-100">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                    <div 
                      className="h-full bg-teal-600 transition-all duration-500"
                      style={{ width: `${(currentMilestoneIndex / (milestoneSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative z-10 flex items-center justify-between">
                    {milestoneSteps.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = idx <= currentMilestoneIndex;
                      const isCurrent = idx === currentMilestoneIndex;
                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted 
                              ? 'bg-teal-600 text-white shadow-sm ring-4 ring-teal-50' 
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span className={`text-[11px] font-semibold mt-2 text-center hidden sm:block ${
                            isCurrent ? 'text-teal-800 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Route & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Origin Corridor
                  </span>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">{trackingData.origin}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Final Destination
                  </span>
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">{trackingData.destination}</span>
                  </div>
                </div>
              </div>

              {/* Current Location Banner */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Live Physical Checkpoint
                    </span>
                    <span className="text-sm font-bold text-white">
                      {trackingData.currentLocation || 'In Transit'}
                    </span>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[11px] text-slate-400 block font-medium">Network SLA</span>
                  <span className="text-xs font-semibold text-emerald-400">Guaranteed On Schedule</span>
                </div>
              </div>

            </div>

            {/* Checkpoint Chronological Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">Checkpoint Audit Log</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {trackingData.history?.length || 0} milestone checkpoints recorded
                </span>
              </div>

              {trackingData.history && trackingData.history.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {trackingData.history.map((event, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Node Bullet */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      </div>

                      <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900">{event.status}</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(event.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.location}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No milestone history available yet.</p>
              )}
            </div>

            {/* Bottom Support & Booking Footer */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Need assistance with this parcel?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Our 24/7 automated delivery assistant is available to help reschedule or clarify route details.</p>
                </div>
              </div>
              <Link
                href="/create-shipment"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition whitespace-nowrap"
              >
                Schedule New Pickup →
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Tracking;
