'use client';

import Link from 'next/link';
import { 
  Navigation, 
  Truck, 
  Plane, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';

const services = [
  {
    title: 'Real-Time GPS Telemetry',
    category: 'Visibility',
    icon: Navigation,
    sla: 'Sub-minute pings',
    desc: 'Automated satellite coordinates, continuous driver telemetry, dynamic route optimization, and transparent recipient tracking links.',
    features: ['Live coordinate pings', 'Estimated time of arrival (ETA)', 'Automated milestone SMS notifications']
  },
  {
    title: 'Express Priority Air Freight',
    category: 'Speed',
    icon: Plane,
    sla: 'Guaranteed 24 Hours',
    desc: 'Dedicated interstate priority air cargo corridors guaranteeing next-day delivery between primary metro economic hubs.',
    features: ['Airport-to-door expedited transit', 'Priority sorting ingestion', 'Dedicated cargo space guarantee']
  },
  {
    title: 'Doorstep Courier Dispatch',
    category: 'Hyper-Local',
    icon: Truck,
    sla: '60-min pickup SLA',
    desc: 'Automated courier pickup straight from your doorstep, retail store, or fulfillment center with instant digital barcode assignment.',
    features: ['Doorstep weight calibration', 'Tamper-proof physical security seals', 'Digital pickup receipt confirmation']
  },
  {
    title: 'Enterprise Fleet & Cargo Freight',
    category: 'Corporate B2B',
    icon: Building2,
    sla: 'Dedicated capacity',
    desc: 'Comprehensive full-truckload (FTL) and less-than-truckload (LTL) solutions for multi-city commercial distribution networks.',
    features: ['Dedicated commercial trucks', 'Custom ERP & Shopify API webhooks', 'Consolidated monthly GST invoicing']
  },
  {
    title: 'Temperature-Controlled Transit',
    category: 'Specialized',
    icon: Cpu,
    sla: '2°C to 8°C Calibrated',
    desc: 'Specialized cold-chain logistics infrastructure built for pharmaceuticals, medical diagnostics, laboratory samples, and perishables.',
    features: ['Active temperature data loggers', 'Insulated cryogenic containers', 'Priority transit clearance']
  },
  {
    title: 'Comprehensive Transit Insurance',
    category: 'Security',
    icon: ShieldCheck,
    sla: 'Up to ₹50 Lakh Cover',
    desc: 'Complete declared-value protection against transit damage, pilferage, and loss with rapid 48-hour claims adjudication.',
    features: ['100% declared value coverage', 'Zero-paperwork digital claims', 'Direct settlement to bank account']
  }
];

export default function ServicesPage() {
  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-900 pt-28 pb-20 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-semibold text-teal-800 mb-4 shadow-2xs">
            <PackageCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>End-to-End Supply Chain Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Logistics Solutions for Every Scale
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            From single priority documents to national multi-drop corporate freight, Prime Dispatcher powers reliable, automated dispatch infrastructure across 100+ cities.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 mt-1 mb-3">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{item.sla}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  <ul className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                    {item.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/create-shipment"
                  className="w-full py-2.5 px-4 bg-teal-50/60 hover:bg-teal-600 hover:text-white text-teal-800 rounded-xl text-xs font-semibold text-center border border-teal-200 transition flex items-center justify-center gap-1.5"
                >
                  <span>Book Consignment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold">Have custom logistics or B2B requirements?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
              Our enterprise logistics coordinators can configure dedicated delivery corridors, recurring schedule pickups, and custom API webhook feeds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/contact"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition text-center shadow-sm"
            >
              Contact Operations Desk
            </Link>
            <Link
              href="/create-shipment"
              className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition text-center"
            >
              Book Individual Courier →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
