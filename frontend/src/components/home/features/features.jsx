import { Truck, Timer, Globe, ShieldCheck } from "lucide-react";

export default function Features() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          Why Choose Prime Dispatcher?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          We provide cutting-edge logistics solutions to ensure your packages reach their destinations swiftly, safely, and transparently.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center">
            <Truck className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Fast Delivery</h3>
            <p className="text-gray-600 mt-2">
              Same-day and next-day delivery options with optimized routing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center">
            <Timer className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Real-Time Tracking</h3>
            <p className="text-gray-600 mt-2">
              Know exactly where your package is at every moment.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center">
            <Globe className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Global Reach</h3>
            <p className="text-gray-600 mt-2">
              We deliver locally and internationally through reliable partners.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Secure & Insured</h3>
            <p className="text-gray-600 mt-2">
              Your shipments are protected with top-tier safety protocols.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
