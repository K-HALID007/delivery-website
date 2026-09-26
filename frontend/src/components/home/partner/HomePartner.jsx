'use client';

import { useState } from 'react';
import { Truck, DollarSign, Clock, ShieldCheck, ArrowRight, UserPlus, Star } from 'lucide-react';
import PartnerAuthModal from '@/components/partner/PartnerAuthModal';

export default function HomePartner() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('register');

  const handleOpenRegister = () => {
    setModalType('register');
    setShowModal(true);
  };

  const handleOpenLogin = () => {
    setModalType('login');
    setShowModal(true);
  };

  return (
    <section id="partner" className="py-20 bg-white border-b border-slate-200 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Benefits & Value Prop */}
          <div className="lg:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Partner Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              Drive and Earn with Prime Dispatcher
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed max-w-2xl">
              Join our certified logistics driver fleet. Receive daily delivery routes, guaranteed transparent settlements, and full accidental insurance coverage.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Weekly Payouts</h4>
                <p className="text-xs text-slate-600 mt-1">Direct bank deposits every Tuesday without delays.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Flexible Shifts</h4>
                <p className="text-xs text-slate-600 mt-1">Choose your local zones and delivery hours freely.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Insurance Included</h4>
                <p className="text-xs text-slate-600 mt-1">₹5 Lakh comprehensive medical & transit cover.</p>
              </div>
            </div>

            {/* Metric pill */}
            <div className="mt-8 flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1 text-slate-900 font-semibold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>4.8 / 5.0</span>
              </div>
              <span>•</span>
              <span>Over 12,000+ active partner drivers across 100+ cities</span>
            </div>
          </div>

          {/* Right Column: Clean Action Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900">Join As a Delivery Partner</h3>
              <p className="text-xs text-slate-600 mt-1">Submit your verification documents and start delivering within 24 hours.</p>

              <div className="space-y-3.5 my-6">
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800">1</span>
                  <span>Valid Driving License & Aadhaar card</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800">2</span>
                  <span>Two-wheeler / Commercial vehicle with RC</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800">3</span>
                  <span>Android smartphone with active GPS</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register as Partner</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="w-full py-2.5 px-4 border border-slate-300 hover:bg-white text-slate-800 font-medium rounded-lg text-sm transition"
                >
                  Existing Partner Portal Login
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PartnerAuthModal
          isOpen={showModal}
          initialMode={modalType}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
}
