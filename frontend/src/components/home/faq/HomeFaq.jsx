'use client';

import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Do I need an account to track my package?',
    a: 'No! Anyone with a valid Tracking ID can paste the number right in our homepage search bar or visit the Track Package page to see real-time updates instantly without logging in.'
  },
  {
    q: 'How fast is Express Courier delivery?',
    a: 'Express delivery delivers within the same day (intra-city) or within 24 hours for major metro corridors. Standard deliveries typically arrive within 2 to 4 business days depending on transit distance.'
  },
  {
    q: 'What happens if the recipient is not at home?',
    a: 'Our dispatch rider will attempt to call the recipient. If unreachable, two additional re-attempts are scheduled free of charge. You can also reschedule the delivery date or time window directly via our chatbot.'
  },
  {
    q: 'How do I join as a Delivery Partner?',
    a: 'Simply click "Join as Partner" on our website or visit the Partner section. Submit your basic ID (Aadhaar, Driving License, and Vehicle RC). Verification is completed within 24 hours so you can start delivering immediately.'
  },
  {
    q: 'What is the refund and complaint resolution process?',
    a: 'If a delivery is delayed past our SLA or damaged in transit, you can file an instant ticket via our AI Chatbot or contact form. Our claims team reviews and processes refunds directly back to your payment source.'
  }
];

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-white border-b border-slate-200/80 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Common Inquiries
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Everything you need to know about tracking, shipping rates, and delivery operations.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen ? 'border-teal-400 bg-teal-50/20 shadow-2xs' : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-slate-900 transition"
                >
                  <span className="text-sm sm:text-base font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? 'transform rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-teal-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Need more help */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900">Have a specific question not answered here?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Our support team and 24/7 AI chatbot are available around the clock.</p>
          </div>
          <Link
            href="#contact"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition whitespace-nowrap shadow-sm"
          >
            Contact Support →
          </Link>
        </div>

      </div>
    </section>
  );
}
