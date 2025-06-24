export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <section className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-600 text-lg">
          Choose a plan that fits your scale — whether you're a growing startup or an enterprise-grade operation.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {/* Plan 1 */}
        <div className="border border-slate-200 rounded-2xl shadow-sm p-8 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Starter</h2>
          <p className="text-sm text-slate-500 mb-6">Best for small businesses and trial users.</p>
          <p className="text-4xl font-bold text-yellow-500 mb-4">₹999 <span className="text-base text-slate-500 font-medium">/month</span></p>
          <ul className="space-y-3 text-slate-600 text-sm mb-6">
            <li>✓ 100 shipments/month</li>
            <li>✓ Basic tracking dashboard</li>
            <li>✓ Email notifications</li>
            <li>✓ 5 team members</li>
          </ul>
          <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition">
            Choose Plan
          </button>
        </div>

        {/* Plan 2 - Most Popular */}
        <div className="border-2 border-yellow-500 rounded-2xl shadow-lg p-8 relative bg-slate-50">
          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            Most Popular
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Business</h2>
          <p className="text-sm text-slate-500 mb-6">For logistics teams and medium-sized businesses.</p>
          <p className="text-4xl font-bold text-yellow-500 mb-4">₹2,999 <span className="text-base text-slate-500 font-medium">/month</span></p>
          <ul className="space-y-3 text-slate-600 text-sm mb-6">
            <li>✓ 1,000 shipments/month</li>
            <li>✓ Advanced analytics</li>
            <li>✓ SMS + Email notifications</li>
            <li>✓ 15 team members</li>
            <li>✓ API access</li>
          </ul>
          <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition">
            Choose Plan
          </button>
        </div>

        {/* Plan 3 */}
        <div className="border border-slate-200 rounded-2xl shadow-sm p-8 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Enterprise</h2>
          <p className="text-sm text-slate-500 mb-6">Custom solutions for large-scale logistics operations.</p>
          <p className="text-4xl font-bold text-yellow-500 mb-4">Contact Us</p>
          <ul className="space-y-3 text-slate-600 text-sm mb-6">
            <li>✓ Unlimited shipments</li>
            <li>✓ Dedicated account manager</li>
            <li>✓ SLA-based support</li>
            <li>✓ Custom integrations</li>
            <li>✓ White-label dashboard</li>
          </ul>
          <button className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition">
            Request Demo
          </button>
        </div>
      </div>
    </main>
  );
}
