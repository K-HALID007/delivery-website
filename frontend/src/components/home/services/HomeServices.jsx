'use client';

import Link from 'next/link';
import { 
  Navigation, 
  Truck, 
  Plane, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

const services = [
  {
    title: 'Real-Time GPS Telemetry',
    category: 'Visibility',
    desc: 'Live vehicle tracking with sub-minute telemetry updates, driver coordinates, and dynamic delivery estimates.',
    icon: Navigation,
  },
  {
    title: 'Express Priority Air Freight',
    category: 'Speed',
    desc: 'Guaranteed 24-hour next-day interstate transit between all primary industrial and metro corridors.',
    icon: Plane,
  },
  {
    title: 'Door-to-Door Courier Pickup',
    category: 'Hyper-Local',
    desc: 'Automated dispatch with 60-minute pickup SLAs right from your home or warehouse with digital weighing.',
    icon: Truck,
  },
  {
    title: 'B2B Enterprise Fleet Logistics',
    category: 'Corporate',
    desc: 'Dedicated commercial trucks, bulk cargo freight, automated monthly invoicing, and priority account managers.',
    icon: Building2,
  },
  {
    title: 'Temperature-Sensitive Transit',
    category: 'Specialized',
    desc: 'Calibrated cold-chain logistics for pharmaceutical drugs, medical supplies, and perishable consumables.',
    icon: Cpu,
  },
  {
    title: 'Comprehensive Transit Insurance',
    category: 'Security',
    desc: 'Complete declared value coverage up to ₹500,000 for sensitive electronics, fragile goods, and luxury documents.',
    icon: ShieldCheck,
  },
];

export default function HomeServices() {
  return (
    <section id="services" className="py-20 bg-slate-50/70 border-b border-slate-200/80 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Logistics Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Comprehensive Delivery Infrastructure
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2.5">
              Engineered for individuals, direct-to-consumer brands, and multinational corporate freight.
            </p>
          </div>
          <Link
            href="/create-shipment"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition"
          >
            <span>Book a courier consignment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 hover:border-teal-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <Link
                    href="/create-shipment"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition"
                  >
                    <span>Ship With This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prime Dispatcher Dedicated Air Freight Corridor Showcase Banner */}
        <div className="mt-14 rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>Prime Dispatcher Priority Air Freight</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Guaranteed Next-Day Air Corridors
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl">
              Dedicated Boeing freighter capacity connecting major commercial economic zones across Mumbai, Delhi, Bengaluru, Hyderabad, and Kolkata within 24 hours. Full transit insurance and real-time runway-to-door telemetry included.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">24h</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Interstate Transit</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">₹50 Lakh</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Transit Insurance</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">99.9%</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">SLA Adherence</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/create-shipment"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm"
              >
                Book Priority Air Cargo →
              </Link>
              <Link
                href="/pricing"
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-xs sm:text-sm transition"
              >
                View Cargo Rates
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden min-h-[300px]">
            <img 
              src="/images/express-air-cargo.jpg" 
              alt="Prime Dispatcher Commercial Boeing Cargo Logistics"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-semibold">
              Live Air Corridor
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
