'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Calculator, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Truck,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import LoginRegisterModal from '../navbar/loginregistermodal';

export default function Hero() {
  const [activeTab, setActiveTab] = useState('track'); // 'track' | 'calculate' | 'book'
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Rate calculator state
  const [fromCity, setFromCity] = useState('Mumbai');
  const [toCity, setToCity] = useState('Delhi');
  const [weight, setWeight] = useState(2);
  const [serviceType, setServiceType] = useState('standard');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    router.push(`/track-package?trackingId=${encodeURIComponent(trackingNumber.trim())}`);
  };

  const calculateEstimate = () => {
    const baseRate = serviceType === 'express' ? 220 : 120;
    const weightFactor = weight * (serviceType === 'express' ? 55 : 35);
    return Math.round(baseRate + weightFactor);
  };

  return (
    <section id="hero" className="relative w-full pt-28 pb-20 flex items-center justify-center bg-slate-50/70 border-b border-slate-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Top Clean Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI-Optimized Courier & Freight Dispatch Network</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
            Deliver faster. Track with precision. <br className="hidden sm:inline" />
            Every package, everywhere.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
            Enterprise-grade delivery infrastructure with live GPS telemetry, automated SMS notifications, and guaranteed door-to-door transit across 100+ cities.
          </p>

          {/* Interactive Multi-tool Card (Tabs) */}
          <div className="w-full max-w-3xl mt-10 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-7 text-left">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 pb-3 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'track'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4" />
                Track Package
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calculate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'calculate'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Rate Calculator
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'book'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                Book Courier
              </button>
            </div>

            {/* Tab 1: Instant Track Package */}
            {activeTab === 'track' && (
              <div className="pt-6">
                <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Tracking ID (e.g. TRK-491028)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition text-sm font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                  >
                    <span>Track Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Examples */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Sample Tracking IDs:</span>
                  <button
                    type="button"
                    onClick={() => setTrackingNumber('TRK-DEL-89210')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition font-mono border border-slate-200"
                  >
                    TRK-DEL-89210
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingNumber('TRK-MUM-54219')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition font-mono border border-slate-200"
                  >
                    TRK-MUM-54219
                  </button>
                  <span className="ml-auto text-slate-600 font-medium hidden sm:inline">No account required to track</span>
                </div>
              </div>
            )}

            {/* Tab 2: Rate Calculator */}
            {activeTab === 'calculate' && (
              <div className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Pickup City</label>
                    <select
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-slate-900"
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Destination City</label>
                    <select
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-slate-900"
                    >
                      <option value="Delhi">Delhi</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Pune">Pune</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Jaipur">Jaipur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Weight: {weight} kg</label>
                    <input
                      type="range"
                      min="0.5"
                      max="30"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full accent-slate-900 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Speed</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-slate-900"
                    >
                      <option value="standard">Standard (3-4 Days)</option>
                      <option value="express">Express Priority (24h)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-slate-800">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Estimated Cost ({fromCity} → {toCity})</div>
                      <div className="text-xl font-extrabold text-slate-900">
                        ₹{calculateEstimate()} <span className="text-xs font-medium text-slate-600">(All taxes included)</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/create-shipment"
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm text-center transition shadow-sm"
                  >
                    Proceed to Booking →
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 3: Quick Book Courier */}
            {activeTab === 'book' && (
              <div className="pt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Doorstep Courier Pickup in 60 Mins</h4>
                    <p className="text-xs text-slate-600 font-medium mt-1">Our certified dispatch partner will arrive, inspect, weigh, and package your shipment at your door.</p>
                  </div>
                  <Link
                    href="/create-shipment"
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition shadow-sm text-center whitespace-nowrap"
                  >
                    Schedule Pickup Now →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Clean Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 max-w-4xl w-full border-t border-slate-200 pt-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">99.8%</div>
              <div className="text-xs text-slate-700 uppercase tracking-wider font-bold mt-1">On-Time Delivery</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">500,000+</div>
              <div className="text-xs text-slate-700 uppercase tracking-wider font-bold mt-1">Parcels Dispatched</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100+</div>
              <div className="text-xs text-slate-700 uppercase tracking-wider font-bold mt-1">Metro Cities</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4.9 / 5.0</div>
              <div className="text-xs text-slate-700 uppercase tracking-wider font-bold mt-1">Customer Rating</div>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <LoginRegisterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onLoginSuccess={() => setShowModal(false)}
        />
      )}
    </section>
  );
}
