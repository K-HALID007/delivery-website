'use client';

import { 
  Zap, 
  MapPin, 
  ShieldCheck, 
  Bot, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Smart Route Optimization',
    desc: 'Machine learning dispatcher continuously calculates optimal transit routes around traffic, congestion, and delays.',
    icon: Zap,
    metric: '35% Faster Transit'
  },
  {
    title: 'Pinpoint GPS Telemetry',
    desc: 'Automated satellite coordinates updated every 15 seconds. Know the exact corridor your driver is navigating.',
    icon: MapPin,
    metric: '15-sec GPS Ping'
  },
  {
    title: 'Full Transit Insurance',
    desc: 'Tamper-proof physical security seals and digital verification checks ensure zero lost parcels and safe handling.',
    icon: ShieldCheck,
    metric: '100% Value Insured'
  },
  {
    title: '24/7 AI Delivery Assistant',
    desc: 'Check live status, reschedule delivery windows, or resolve inquiries instantly using our smart AI assistant.',
    icon: Bot,
    metric: 'Instant Response'
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white border-b border-slate-200/80 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Technology Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Built for Reliability and Speed
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Modern logistics software powering reliable, on-time deliveries at national scale.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 mb-4 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100">
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-md">
                    {feat.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
