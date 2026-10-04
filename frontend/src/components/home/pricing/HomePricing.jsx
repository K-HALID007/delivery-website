'use client';

import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Standard Ground',
    desc: 'Cost-effective ground shipping for regular ecommerce orders, documents, and apparel.',
    price: '₹49',
    period: 'starts at 500g (+₹30/addl. kg)',
    badge: 'Standard Ground',
    popular: false,
    features: [
      '2 to 4 Days Nationwide Transit',
      'Real-Time GPS Milestone Tracking',
      'Doorstep Delivery Attempt (up to 3x)',
      'Free Transit Insurance up to ₹5,000',
      'Automated SMS & WhatsApp Alerts',
      'Standard In-App Support'
    ],
    buttonText: 'Book Standard Shipment',
    buttonLink: '/create-shipment'
  },
  {
    name: 'Express Priority Air',
    desc: 'Lightning-fast air freight guaranteed next-day delivery between major metros.',
    price: '₹119',
    period: 'starts at 500g (+₹60/addl. kg)',
    badge: 'Guaranteed 24h',
    popular: true,
    features: [
      'Guaranteed 24-Hour Express Next-Day',
      'Dedicated Air Freight Priority Routing',
      'Sub-Minute Live GPS Telemetry',
      'Free Declared Insurance up to ₹25,000',
      'Contactless OTP Secure Handover',
      'Priority 24/7 AI & Phone Support',
      'Free Delivery Window Rescheduling'
    ],
    buttonText: 'Book Express Shipment',
    buttonLink: '/create-shipment'
  },
  {
    name: 'B2B Cargo & Freight',
    desc: 'Dedicated commercial trucks, dock-to-dock warehouse delivery, and bulk consignments.',
    price: '₹14',
    period: 'per KG (minimum 20 kg)',
    badge: 'Commercial Fleet',
    popular: false,
    features: [
      'Dedicated Commercial Trucks & Cargo Fleet',
      'Dock-to-Dock Warehouse Pickup',
      'Guaranteed 99.8% Delivery SLA',
      'Full Transit Insurance up to ₹50 Lakh',
      'Automated GST e-Way Bill & Invoicing',
      'Dedicated Named Account Manager'
    ],
    buttonText: 'Inquire for Cargo Rates',
    buttonLink: '/pricing'
  }
];

export default function HomePricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50/70 border-b border-slate-200/80 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
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
                  ? 'bg-white border-2 border-teal-600 shadow-xl shadow-teal-700/10 relative ring-1 ring-teal-600/30'
                  : 'bg-white border border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    tier.popular
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{tier.desc}</p>

                <div className="my-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{tier.price}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold block mt-1">{tier.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={tier.buttonLink}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-center transition block shadow-sm ${
                    tier.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {tier.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Billing Footnote */}
        <div className="mt-10 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 border-t border-slate-200/80">
          <span className="font-semibold text-slate-700">✓ 100% Transparent Billing</span>
          <span>✓ Zero Hidden Fuel Surcharges</span>
          <span>✓ 18% GST Included</span>
          <span>✓ Volumetric Formula: (L × W × H in cm) ÷ 5000</span>
        </div>

      </div>
    </section>
  );
}
