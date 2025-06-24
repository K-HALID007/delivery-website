"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, History } from 'lucide-react';
import { trackingService } from '@/services/tracking.service';

const Tracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      console.log('Tracking ID being sent:', trackingId);
      let attempts = 0;
      let lastError = null;
      let data;
      
      while (attempts < 3) {
        try {
          data = await trackingService.trackPackage(trackingId);
          break;
        } catch (err) {
          lastError = err;
          if (err.message === 'Tracking ID not found') {
            attempts++;
            if (attempts < 3) {
              await new Promise(res => setTimeout(res, 1000));
            }
          } else {
            throw err;
          }
        }
      }
      if (!data && lastError) throw lastError;
      
      setTrackingData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill trackingId from URL, but do NOT auto-track
  useEffect(() => {
    const urlTrackingId = searchParams.get('trackingId');
    if (urlTrackingId) {
      setTrackingId(urlTrackingId);
      // Remove trackingId from URL so it doesn't persist on refresh
      router.replace('/track-package');
    }
    // eslint-disable-next-line
  }, [searchParams]);

  if (loading) {
    // Skeleton screen
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-8 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="h-5 w-1/2 bg-gray-200 rounded mb-8"></div>
            <div className="flex space-x-4 mb-8">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 w-full bg-gray-200 rounded mb-6"></div>
            <div className="h-8 w-1/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-1/4 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Package</h1>
            <p className="text-gray-500">Enter your tracking ID to track your shipment</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-black"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Track Package'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <div className="mt-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Tracking Information</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    trackingData.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800'
                      : trackingData.status === 'In Transit'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trackingData.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
                    <p className="font-medium text-gray-900">{trackingData.trackingId}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Current Location</p>
                    <p className="font-bold text-amber-600 text-lg flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z" /></svg>
                      {trackingData.currentLocation}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Origin</p>
                    <p className="font-medium text-gray-900">{trackingData.origin}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Destination</p>
                    <p className="font-medium text-gray-900">{trackingData.destination}</p>
                  </div>
                </div>

                {/* Tracking History */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Tracking History</h3>
                  <div className="space-y-4">
                    {trackingData.history.map((item, index) => (
                      <div key={index} className="flex items-start bg-white p-4 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <History className="w-5 h-5 text-amber-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{item.status}</p>
                          <p className="text-sm text-gray-500">{item.location}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking; 