'use client';

import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Standard Parcel',
    desc: 'Cost-effective ground shipping for regular ecommerce orders and documents.',
    price: '₹120',
    period: 'per parcel (up to 2 kg)',
    badge: 'Standard Ground',
    popular: false,
    features: [
      '2 to 4 Days Nationwide Transit',
      'Real-Time GPS Milestone Tracking',
      'Doorstep Delivery Attempt (up to 3x)',
      'Free Transit Insurance up to ₹5,000',
      'Automated SMS & Email Alerts',
      'Standard In-App Support'
    ],
    buttonText: 'Book Standard Shipment',
    buttonLink: '/create-shipment'
  },
  {
    name: 'Express Priority',
    desc: 'Lightning-fast air freight guaranteed next-day delivery between major metros.',
    price: '₹280',
    period: 'per parcel (up to 2 kg)',
    badge: 'Most Popular',
    popular: true,
    features: [
      'Guaranteed 24-Hour Express Transit',
      'Priority Air Freight Corridor',
      'Sub-Minute Live GPS Telemetry',
      'Free Transit Insurance up to ₹50,000',
      'Instant OTP Secure Handover',
      'Priority 24/7 AI & Phone Support',
      'Free Rescheduling Anytime'
    ],
    buttonText: 'Book Express Shipment',
    buttonLink: '/create-shipment'
  },
  {
    name: 'Enterprise Fleet',
    desc: 'Customized dedicated solutions for high-volume corporate logistics.',
    price: 'Custom',
    period: 'volume contract pricing',
    badge: 'Corporate Freight',
    popular: false,
    features: [
      'Dedicated Commercial Trucks & Drivers',
      'Guaranteed 99.9% Delivery SLA',
      'Full Transit Insurance up to ₹50 Lakh',
      'Custom ERP & Webhook Integrations',
      'Monthly Invoicing & Flexible Credit',
      'Dedicated Account Manager'
    ],
    buttonText: 'Inquire for Enterprise',
    buttonLink: '#contact'
  }
];

export default function HomePricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50/50 border-b border-slate-200 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
            Straightforward Rates. No Hidden Fees.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Transparent pricing based on actual weight and distance. All taxes included.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
                tier.popular
                  ? 'bg-white border-2 border-slate-900 shadow-xl relative'
                  : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    tier.popular
                      ? 'bg-amber-400/90 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <p className="text-xs text-slate-600 mt-1 min-h-[36px]">{tier.desc}</p>

                <div className="my-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{tier.price}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-bold block mt-1">{tier.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={tier.buttonLink}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm text-center transition block ${
                    tier.popular
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      : 'border border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {tier.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
