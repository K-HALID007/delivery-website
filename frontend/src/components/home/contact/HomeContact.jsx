'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function HomeContact() {
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
      toast.success('Your message has been received! Our support team will contact you shortly.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 bg-slate-50/70 border-b border-slate-200/80 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Support & Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Contact Our Dispatch Support
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Reach out for enterprise contract pricing, consignment tracking assistance, or driver queries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Headquarters</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Prime Dispatcher Logistics Ltd.<br />
                  BKC Logistics Corridor, Bandra Kurla Complex,<br />
                  Mumbai, MH 400051, India
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Telephone Support</h4>
                <p className="text-xs text-slate-600 mt-1">Toll Free: 1800-419-0099</p>
                <p className="text-xs text-slate-600">Direct Ops: +91 98765 43210</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Email Desks</h4>
                <p className="text-xs text-slate-600 mt-1">support@primedispatcher.com</p>
                <p className="text-xs text-slate-600">corporate@primedispatcher.com</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Operational Hours</h4>
                <p className="text-xs text-slate-600 mt-1">Dispatch Fleet: 24/7 / 365 Days</p>
                <p className="text-xs text-slate-600">Customer Support: Mon - Sat, 8:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Send a Direct Inquiry</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">Our support team responds within 2 hours during business operations.</p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-teal-50 border border-teal-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-teal-900">Message Received</h4>
                <p className="text-xs text-teal-700 mt-1">Thank you! We have logged your request and a dispatch specialist will contact you shortly.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-semibold text-teal-800 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Topic / Subject *</label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="">Select a topic</option>
                      <option value="tracking">Package Tracking Issue</option>
                      <option value="enterprise">Corporate Freight & Pricing</option>
                      <option value="partner">Delivery Partner Inquiry</option>
                      <option value="claims">Refund or Damaged Claim</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide details about your shipment, consignment number, or business requirements..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Transmitting Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
