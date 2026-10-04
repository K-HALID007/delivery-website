'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  CreditCard,
  Smartphone,
  FileCheck
} from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import PartnerAuthModal from '@/components/partner/PartnerAuthModal';

export default function PartnerPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('register');

  const handleStartJourney = () => {
    setModalType('register');
    setShowModal(true);
  };

  const handlePartnerLogin = () => {
    setModalType('login');
    setShowModal(true);
  };

  const handleLoginSuccess = () => {
    setShowModal(false);
    window.location.href = '/partner/dashboard';
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between antialiased">
      <Navbar />

      <main className="pt-28 pb-20 flex-1">
        {/* Hero Section */}
        <section className="bg-slate-50/70 border-b border-slate-200 py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col items-center text-center">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-2xs mb-6">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span>Certified Dispatch Logistics Fleet</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-3xl">
                Deliver with certainty. <br className="hidden sm:inline" />
                Earn on your own schedule.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                Join our certified national courier network. Access guaranteed daily delivery routes, transparent weekly bank settlements, and complete accidental transit insurance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleStartJourney}
                  className="w-full sm:w-auto px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2"
                >
                  <span>Apply as Delivery Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePartnerLogin}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 transition text-sm"
                >
                  Fleet Portal Login
                </button>
              </div>

              {/* 4 Performance Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-14 w-full max-w-4xl">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">15,000+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Active Couriers</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹28,000</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Avg. Monthly Payout</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Metro Cities</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">Weekly</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Direct Bank Transfer</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Partner Advantage
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">
                Built to Support Our Drivers
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Transparent payout policies and dependable tools to maximize your daily income.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-2xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Guaranteed Settlements</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Earn competitive per-drop base fees plus distance multipliers. Direct bank transfers every Tuesday without deductions.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Flexible Autonomous Hours</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Choose morning, afternoon, or evening delivery shifts. Operate freely in your local preferred neighborhood zones.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Medical & Transit Cover</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  ₹5 Lakh comprehensive accidental protection policy covering you and your vehicle from the minute you accept a route.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Dedicated Fleet Desk</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Direct telephone support line with dispatch coordinators to resolve delivery address anomalies or handover delays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Onboarding Pipeline */}
        <section className="py-20 bg-slate-50/50 border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Onboarding Process
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">
                Start Delivering in 3 Easy Steps
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Digital document verification completed within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-4 shadow-2xs">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900">Register Online</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Fill in your basic information, vehicle classification, and address using our secure driver portal.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-4 shadow-2xs">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900">KYC Verification</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Upload photos of your Driving License and Vehicle RC. Our compliance team verifies details within 24 hours.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-4 shadow-2xs">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900">Activate & Earn</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Log into the Partner Fleet Console, toggle your status to Active, and begin accepting high-yield delivery consignments.
                </p>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-12 p-8 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold">Ready to earn on your terms?</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Submit your application now and our fleet team will contact you to finalize document verification.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartJourney}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition whitespace-nowrap shadow-sm"
              >
                Start Partner Registration →
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Partner Auth Modal */}
      {showModal && (
        <PartnerAuthModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onLoginSuccess={handleLoginSuccess}
          defaultTab={modalType}
        />
      )}
    </div>
  );
}