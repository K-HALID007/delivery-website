export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 text-sm pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-slate-700 pb-10">
        
        {/* Column 1: About */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">
            Prime Dispatcher
          </h2>
          <p className="text-slate-400 leading-relaxed">
            We provide real-time logistics and shipment tracking solutions to streamline your supply chain operations with precision, visibility, and speed.
          </p>
        </div>

        {/* Column 2: Services */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
          <ul className="space-y-2 text-slate-400">
            <li>Shipment Visibility Solutions</li>
            <li>Optimized B2B Logistics</li>
            <li>Last-Mile Delivery</li>
            <li>Fleet Management Tools</li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <p className="text-slate-400 mb-2">Prime Dispatcher Pvt. Ltd.</p>
          <p className="text-slate-400 mb-2">Mumbai, Maharashtra, India</p>
          <p className="text-slate-400 mb-2">contact@primedispatcher.com</p>
          <p className="text-slate-400">+91 98765 43210</p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-xs text-slate-500 pt-8">
        © {new Date().getFullYear()} Prime Dispatcher Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
}
