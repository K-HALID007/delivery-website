'use client';

import { 
  PackageCheck, 
  Truck, 
  Warehouse, 
  Navigation, 
  CheckCircle2, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Doorstep Pickup',
    desc: 'Driver arrives at pickup location, scans barcode, and assigns active digital tracking.',
    icon: PackageCheck,
  },
  {
    step: '02',
    title: 'Hub Sorting',
    desc: 'Package verified, weighted, and automatically sorted for regional transit routes.',
    icon: Warehouse,
  },
  {
    step: '03',
    title: 'Highway GPS Transit',
    desc: 'Container transport tracked in real-time with automated checkpoint telemetry.',
    icon: Truck,
  },
  {
    step: '04',
    title: 'Out for Delivery',
    desc: 'Last-mile dispatch assigned to local courier. SMS status notification sent.',
    icon: Navigation,
  },
  {
    step: '05',
    title: 'OTP Handover',
    desc: 'Package delivered safely to recipient with contactless digital confirmation.',
    icon: CheckCircle2,
  }
];

export default function TrackingShowcase() {
  return (
    <section id="tracking" className="py-20 bg-white border-b border-slate-200 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Dispatch Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
            How Every Consignment Moves
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Transparent milestones from sender pickup to final receiver verification.
          </p>
        </div>

        {/* 5-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Clean Callout */}
        <div className="mt-10 p-6 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Full Transit Protection & Real-Time Alerts</h4>
              <p className="text-xs text-slate-300 mt-0.5">Every package has active status tracking, insurance coverage, and automated SMS notifications upon arrival.</p>
            </div>
          </div>
          <Link
            href="/create-shipment"
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-lg text-sm transition whitespace-nowrap"
          >
            Create Shipment →
          </Link>
        </div>

      </div>
    </section>
  );
}
