import Link from 'next/link';
import { Package, ArrowUpRight, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50/90 text-slate-600 text-sm pt-16 pb-12 border-t border-slate-200 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-4 inline-block">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Prime Dispatcher
              </span>
            </Link>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mb-6">
              Enterprise courier and freight logistics. Real-time satellite GPS tracking, guaranteed door-to-door transit, and automated milestone updates nationwide.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-white border border-slate-200/90 p-2.5 rounded-xl max-w-sm shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span className="font-medium">ISO 9001:2015 Certified Logistics Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/#hero" className="text-slate-600 hover:text-teal-700 font-medium transition">Home</Link>
              </li>
              <li>
                <Link href="/#tracking" className="text-slate-600 hover:text-teal-700 font-medium transition">Live Tracking</Link>
              </li>
              <li>
                <Link href="/#services" className="text-slate-600 hover:text-teal-700 font-medium transition">Services Suite</Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-slate-600 hover:text-teal-700 font-medium transition">Pricing Plans</Link>
              </li>
              <li>
                <Link href="/#partner" className="text-slate-600 hover:text-teal-700 font-medium transition">Partner Network</Link>
              </li>
              <li>
                <Link href="/#faq" className="text-slate-600 hover:text-teal-700 font-medium transition">FAQ & Help</Link>
              </li>
            </ul>
          </div>

          {/* Operations & Logic */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Dispatch</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/create-shipment" className="text-slate-600 hover:text-teal-700 font-medium transition flex items-center gap-1">
                  <span>Book Courier</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-teal-600" />
                </Link>
              </li>
              <li>
                <Link href="/track-package" className="text-slate-600 hover:text-teal-700 font-medium transition">Track by ID</Link>
              </li>
              <li>
                <Link href="/my-shipments" className="text-slate-600 hover:text-teal-700 font-medium transition">My Shipments</Link>
              </li>
              <li>
                <Link href="/partner" className="text-slate-600 hover:text-teal-700 font-medium transition">Driver Portal</Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-600 hover:text-teal-700 font-medium transition">Admin Console</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">BKC Logistics Hub, Mumbai, MH 400051</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-slate-600 hover:text-teal-700 font-medium transition">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <a href="mailto:support@primedispatcher.com" className="text-slate-600 hover:text-teal-700 font-medium transition truncate">
                  support@primedispatcher.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Prime Dispatcher Logistics Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/#hero" className="hover:text-teal-700 transition">Privacy Policy</Link>
            <Link href="/#hero" className="hover:text-teal-700 transition">Terms of Service</Link>
            <Link href="/#contact" className="hover:text-teal-700 transition">Claims & Insurance</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
