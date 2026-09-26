'use client';

import { Star, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    name: 'Rohit Verma',
    role: 'Founder, UrbanKicks D2C',
    city: 'Mumbai',
    quote: 'We ship over 400 footwear orders daily. Switching to Prime Dispatcher brought our return-to-origin (RTO) rate down from 14% to under 4%. The automated SMS notifications give buyers complete visibility.',
    rating: 5,
    tag: 'E-Commerce Seller'
  },
  {
    name: 'Ananya Sharma',
    role: 'Supply Chain Head, BioNutra',
    city: 'Bangalore',
    quote: 'Their real-time tracking is legitimately accurate. I can see driver coordinates and delivery milestones instantly. Customer queries on parcel status dropped significantly since switching.',
    rating: 5,
    tag: 'Health & Wellness'
  },
  {
    name: 'Kunal Singhania',
    role: 'Operations Director, Apex Tech',
    city: 'Delhi NCR',
    quote: 'Managing corporate IT hardware logistics across 12 branch offices used to be stressful. Their Enterprise tier gives us consolidated weekly invoicing and guaranteed transit insurance.',
    rating: 5,
    tag: 'Corporate Freight'
  }
];

export default function HomeTestimonials() {
  return (
    <section id="testimonials" className="py-20 bg-slate-50/50 border-b border-slate-200 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
            Customer Proof
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
            Trusted by Growing Businesses
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5">
            Hear how direct-to-consumer brands and corporate operations rely on our network daily.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    {t.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-600 font-medium">{t.role} • {t.city}</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
