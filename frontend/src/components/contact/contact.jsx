'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck, Headphones } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Your message has been transmitted to our operations team.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 900);
  };

  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-900 pt-28 pb-20 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-semibold text-teal-800 mb-4 shadow-2xs">
            <Headphones className="w-3.5 h-3.5 text-teal-700" />
            <span>24/7 Operations Support Desk</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Contact Prime Dispatcher
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Have questions regarding an active consignment, corporate freight contract, or driver partnership? Our operations coordinators respond promptly.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Headquarters & Desks */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">National Dispatch Headquarters</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Prime Dispatcher Logistics Pvt. Ltd.<br />
                    Bandra Kurla Complex, Corporate Hub Zone 4<br />
                    Mumbai, Maharashtra 400051, India
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Telephone Lines</h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-700">Toll Free:</span> 1800-419-0099</p>
                    <p><span className="font-semibold text-slate-700">Operations Desk:</span> +91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Electronic Mail Desks</h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-700">Support:</span> support@primedispatcher.com</p>
                    <p><span className="font-semibold text-slate-700">Enterprise:</span> corporate@primedispatcher.com</p>
                    <p><span className="font-semibold text-slate-700">Fleet Partners:</span> fleet@primedispatcher.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Operations Schedule</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Fleet Dispatch: Continuous 24/7/365<br />
                    Support Desk: Monday – Saturday, 8:00 AM – 10:00 PM IST
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-2xs">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Send an Inquiry</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Fill in your details below and a dispatch coordinator will contact you within 2 business hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-emerald-900">Message Successfully Transmitted</h4>
                <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                  Thank you for reaching out. We have registered your ticket and a representative will follow up via email or phone.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Inquiry Category *
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition"
                    >
                      <option value="">Select an inquiry type</option>
                      <option value="tracking">Package Milestone / Tracking Issue</option>
                      <option value="enterprise">Corporate Freight & Volume Rates</option>
                      <option value="partner">Delivery Fleet Partner Support</option>
                      <option value="claims">Insurance Claim / Damage Report</option>
                      <option value="other">General Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detailed Message *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide relevant consignment tracking IDs, shipping corridors, or commercial requirements..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Transmitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
