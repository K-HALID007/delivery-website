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
  const [weight, setWeight] = useState(1);
  const [serviceType, setServiceType] = useState('standard');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    router.push(`/track-package?trackingId=${encodeURIComponent(trackingNumber.trim())}`);
  };

  const getZoneInfo = () => {
    if (fromCity === toCity) {
      return {
        zone: 'Local Intra-City',
        transitTime: serviceType === 'express' ? 'Same-Day (6h)' : '24 Hours',
        baseRate: serviceType === 'express' ? 69 : 39,
        addlKgRate: serviceType === 'express' ? 35 : 20,
      };
    }

    const isRegional = 
      (fromCity === 'Mumbai' && (toCity === 'Pune' || toCity === 'Ahmedabad')) ||
      (fromCity === 'Delhi' && toCity === 'Jaipur') ||
      (fromCity === 'Chennai' && toCity === 'Bangalore') ||
      (fromCity === 'Hyderabad' && toCity === 'Bangalore');

    if (isRegional) {
      return {
        zone: 'Regional Corridor',
        transitTime: serviceType === 'express' ? '24h Guaranteed' : '1 - 2 Days',
        baseRate: serviceType === 'express' ? 99 : 49,
        addlKgRate: serviceType === 'express' ? 50 : 25,
      };
    }

    return {
      zone: 'National Metro',
      transitTime: serviceType === 'express' ? '24h Air Corridor' : '2 - 4 Days Ground',
      baseRate: serviceType === 'express' ? 129 : 69,
      addlKgRate: serviceType === 'express' ? 70 : 35,
    };
  };

  const calculateEstimate = () => {
    const { baseRate, addlKgRate } = getZoneInfo();
    const extraWeight = Math.max(0, weight - 0.5);
    return Math.round(baseRate + (extraWeight * addlKgRate));
  };

  return (
    <section id="hero" className="relative w-full pt-32 pb-20 flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
      {/* Subtle soft background illumination */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Heading, Subtitle & Interactive Card */}
          <div className="lg:col-span-7 flex flex-col text-left">
            
            {/* Top Clean Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-2xs mb-5 self-start">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>High-Precision Courier & Freight Dispatch</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Deliver faster. Track with precision. <br />
              <span className="text-teal-700">Every package, everywhere.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
              Enterprise delivery infrastructure with live GPS telemetry, automated status updates, and guaranteed door-to-door transit across 100+ cities.
            </p>

            {/* Interactive Multi-tool Card (Tabs) */}
            <div className="w-full mt-7 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-6 text-left">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 pb-3 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'track'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4 text-teal-600" />
                <span>Track Package</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calculate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'calculate'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>Rate Calculator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'book'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4 text-teal-600" />
                <span>Book Courier</span>
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
                      placeholder="Enter Tracking ID (e.g. TRK-DEL-89210)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition text-sm font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                  >
                    <span>Track Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Professional Tracking Hint */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Real-time satellite GPS tracking across all domestic corridors</span>
                  </span>
                  <span className="font-medium text-slate-500">No account or login required to track</span>
                </div>
              </div>
            )}

            {/* Tab 2: Rate Calculator */}
            {activeTab === 'calculate' && (
              <div className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup City</label>
                    <select
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-teal-600"
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Destination City</label>
                    <select
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-teal-600"
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Weight: {weight} kg</label>
                    <input
                      type="range"
                      min="0.5"
                      max="30"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Speed</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-teal-600"
                    >
                      <option value="standard">Standard (3-4 Days)</option>
                      <option value="express">Express Priority (24h)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600">{fromCity} → {toCity}</span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                          {getZoneInfo().zone} • {getZoneInfo().transitTime}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        ₹{calculateEstimate()} <span className="text-xs font-normal text-slate-500">(All taxes & fuel included)</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/create-shipment"
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm text-center transition shadow-sm whitespace-nowrap"
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
                    <p className="text-xs text-slate-500 font-medium mt-1">Our certified dispatch partner will arrive, inspect, weigh, and package your shipment at your door.</p>
                  </div>
                  <Link
                    href="/create-shipment"
                    className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm transition shadow-sm text-center whitespace-nowrap"
                  >
                    Schedule Pickup Now →
                  </Link>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Right Column: Sleek Minimal Hero Fleet Showcase */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/60 bg-white group">
              <img 
                src="/images/hero-dispatch-fleet.jpg" 
                alt="Prime Dispatcher Commercial Electric Delivery Fleet" 
                className="w-full h-80 sm:h-96 lg:h-[420px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Top Glass Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Prime Dispatcher Fleet</span>
              </div>

              {/* Bottom Minimal Transit SLA Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-md flex items-center justify-between gap-3 text-left">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Guaranteed Transit</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">Doorstep Pickup to Destination</div>
                </div>
                <div className="text-right pl-3 border-l border-slate-200">
                  <div className="text-sm sm:text-base font-extrabold text-teal-700">99.8%</div>
                  <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">On-Time SLA</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Clean Minimal Trust Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-8 border-t border-slate-200/80 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">99.8%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">On-Time Delivery</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">500,000+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Parcels Dispatched</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Metro Cities</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4.9 / 5.0</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Customer Rating</div>
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
