'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck, HelpCircle, Building2, Zap, Truck } from 'lucide-react';

const plans = [
  {
    name: 'Standard Ground',
    tagline: 'Cost-effective ground courier for ecommerce parcels, documents, and apparel.',
    basePrice: '₹49',
    period: 'starts at 500g (+₹30/addl. kg)',
    popular: false,
    badge: 'Standard Ground',
    features: [
      '2 - 4 business days nationwide transit',
      'Real-time GPS milestone tracking',
      'Free declared value cover up to ₹5,000',
      'Up to 3 doorstep delivery attempts',
      'Automated SMS & WhatsApp delivery alerts',
      'Standard web & email support desk'
    ],
    buttonText: 'Book Ground Consignment',
    buttonLink: '/create-shipment'
  },
  {
    name: 'Express Priority Air',
    tagline: 'Guaranteed 24-hour next-day air corridor transit between all major metros.',
    basePrice: '₹119',
    period: 'starts at 500g (+₹60/addl. kg)',
    popular: true,
    badge: 'Guaranteed 24h',
    features: [
      'Guaranteed next-day express delivery',
      'Dedicated air freight priority routing',
      'Sub-minute live telemetry updates',
      'Transit insurance coverage up to ₹25,000',
      'Contactless OTP recipient handover',
      'Priority 24/7 dispatch phone & AI support',
      'Free flexible delivery window rescheduling'
    ],
    buttonText: 'Book Express Consignment',
    buttonLink: '/create-shipment'
  },
  {
    name: 'B2B Cargo & Freight',
    tagline: 'Dedicated commercial trucks, dock-to-dock warehouse delivery, and bulk cargo.',
    basePrice: '₹14',
    period: 'per KG (min. 20 kg)',
    popular: false,
    badge: 'Commercial Freight',
    features: [
      'Dedicated commercial fleet & cargo trucks',
      'Full transit insurance up to ₹50,00,000',
      'Strict 99.8% on-time delivery SLA guarantee',
      'Custom ERP, Shopify & REST API webhooks',
      'Consolidated monthly GST invoicing & credit',
      'Dedicated named account operations manager'
    ],
    buttonText: 'Inquire for Cargo Rates',
    buttonLink: '/contact'
  }
];

const zoneRateSlabs = [
  { zone: 'Local / Intra-City', range: 'Within City (e.g. Mumbai to Mumbai)', ground: '₹39', groundAddl: '+₹20 / kg', air: '₹69', airAddl: '+₹35 / kg', sla: 'Same-Day (6h) / 24h' },
  { zone: 'Regional / Intra-State', range: 'Neighboring Cities (e.g. Mumbai to Pune)', ground: '₹49', groundAddl: '+₹25 / kg', air: '₹99', airAddl: '+₹50 / kg', sla: '1 - 2 Business Days' },
  { zone: 'National Metro Corridor', range: 'Inter-State Metros (e.g. Mumbai to Delhi)', ground: '₹69', groundAddl: '+₹35 / kg', air: '₹129', airAddl: '+₹70 / kg', sla: 'Ground: 3-4d | Air: 24h' },
  { zone: 'Heavy Commercial Cargo', range: 'Pan-India 20+ kg Consignments', ground: '₹14 / kg', groundAddl: 'Tiered Bulk Rates', air: '₹45 / kg', airAddl: 'Priority Air Freight', sla: '2 - 4 Business Days' },
];

const featureComparison = [
  { feature: 'Delivery Speed SLA', standard: '2 - 4 Days', express: '24 Hours', enterprise: 'Custom / Same-day' },
  { feature: 'Transit Insurance Included', standard: 'Up to ₹5,000', express: 'Up to ₹25,000', enterprise: 'Up to ₹50 Lakh' },
  { feature: 'Live GPS Satellite Telemetry', standard: 'Checkpoint only', express: 'Live Sub-minute', enterprise: 'Continuous GPS Stream' },
  { feature: 'Volumetric Surcharge', standard: 'Formula (L×W×H)/5000', express: 'Formula (L×W×H)/5000', enterprise: 'Custom Pallet Billing' },
  { feature: 'API & Webhook Integrations', standard: '—', express: 'Standard REST', enterprise: 'Full Custom ERP' },
  { feature: 'Dedicated Account Manager', standard: '—', express: '—', enterprise: 'Included' },
  { feature: 'Payment Terms', standard: 'Prepaid / COD', express: 'Prepaid / COD', enterprise: 'Net-30 Invoicing' }
];

export default function PricingPage() {
  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-900 pt-28 pb-20 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-semibold text-teal-800 mb-4 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Transparent Rates • No Hidden Fuel Surcharges</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Straightforward Logistics Pricing
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Whether you are booking a single parcel or shipping thousands of commercial consignments monthly, our rates are calculated transparently with all taxes and insurance included.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-20">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'bg-white border-2 border-teal-600 shadow-xl shadow-teal-700/10 relative ring-1 ring-teal-600/30'
                  : 'bg-white border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    plan.popular
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 min-h-[36px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {plan.basePrice}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold block mt-1">
                    {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={plan.buttonLink}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-center transition block shadow-sm ${
                    plan.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'border border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Domestic Zone & Slab Rate Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-12 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                Pan-India Rate Matrix
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Zone & Weight Slab Breakdown</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Standard baseline rates for ground surface and priority air corridors across domestic transit zones.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                18% GST & Door Pickup Included
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/60">
                  <th className="py-3 px-4">Transit Zone</th>
                  <th className="py-3 px-4">Coverage Route</th>
                  <th className="py-3 px-4">Ground Base (500g)</th>
                  <th className="py-3 px-4">Ground Addl. / kg</th>
                  <th className="py-3 px-4">Air Priority (500g)</th>
                  <th className="py-3 px-4">Transit SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zoneRateSlabs.map((slab, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{slab.zone}</td>
                    <td className="py-3.5 px-4 text-slate-600">{slab.range}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{slab.ground}</td>
                    <td className="py-3.5 px-4 text-slate-600">{slab.groundAddl}</td>
                    <td className="py-3.5 px-4 font-bold text-teal-700">{slab.air} <span className="text-[11px] font-normal text-slate-500">({slab.airAddl})</span></td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{slab.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Volumetric Weight & Chargeable Logic Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Chargeable Weight Rule</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Couriers bill on whichever is higher: the actual scale weight or the volumetric space occupied by your box.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Volumetric Formula</h3>
            <p className="text-xs font-mono font-semibold text-teal-800 mt-1.5 bg-teal-50 px-2 py-1 rounded inline-block">
              (L × W × H in cm) ÷ 5000
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Standard IATA dimensional formula for surface and air freight.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero Hidden Surcharges</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              All displayed rates include standard door-to-door pickup, fuel surcharges, digital barcode labeling, and 18% GST.
            </p>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-20 overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Feature Comparison Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Detailed breakdown of SLAs, technology, and insurance across our service tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 pr-4">Capability</th>
                  <th className="py-3 px-4">Standard Ground</th>
                  <th className="py-3 px-4">Express Air</th>
                  <th className="py-3 pl-4">Enterprise Fleet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {featureComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 pr-4 font-semibold text-slate-900">{row.feature}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.standard}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{row.express}</td>
                    <td className="py-3.5 pl-4 font-bold text-slate-900">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Volume Freight Banner */}
        <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Shipping more than 500 parcels monthly?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Contact our corporate logistics team for dedicated truckload allocations, custom webhook integrations, and preferential volume rate discounts.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition whitespace-nowrap shadow-sm"
          >
            Inquire for Enterprise Rates →
          </Link>
        </div>

      </div>
    </div>
  );
}
