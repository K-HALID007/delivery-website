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
    <section id="services" className="py-20 bg-slate-50/50 border-b border-slate-200 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              Logistics Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              Comprehensive Delivery Infrastructure
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2.5">
              Engineered for individuals, direct-to-consumer brands, and multinational corporate freight.
            </p>
          </div>
          <Link
            href="/create-shipment"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700 transition"
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
                className="bg-white border border-slate-200/90 rounded-xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <Link
                    href="/create-shipment"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-amber-600 transition"
                  >
                    <span>Ship With This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
