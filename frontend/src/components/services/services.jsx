const services = [
  {
    title: "Real-Time Shipment Tracking",
    description:
      "GPS-enabled systems with live shipment visibility, accurate ETAs, and proactive alerts.",
    image:
      "/services/Real-Time Shipment Tracking.jpg",
  },
  {
    title: "Nationwide Freight Management",
    description:
      "Manage freight across the country with route optimization and seamless coordination.",
    image:
      "/services/Nationwide Freight Management.jpg",
  },
  {
    title: "API Integration & Automation",
    description:
      "Automate order creation, status sync, and tracking with modern logistics APIs.",
    image:
      "/services/API Integration & Automation.jpg",
  },
  {
    title: "Enterprise B2B Solutions",
    description:
      "Scalable solutions for businesses with bulk orders, SLAs, and invoicing needs.",
    image:
      "/services/Enterprise B2B Solutions.jpg",
  },
  {
    title: "Customer Notification Systems",
    description:
      "Automated SMS/email alerts for customers at every step of the delivery cycle.",
    image:
      "/services/Customer Notification Systems.jpg",
  },
  {
    title: "Logistics Analytics & Intelligence",
    description:
      "Dashboards and KPIs to help optimize costs, delivery timelines, and performance.",
    image:
      "/services/Logistics Analytics & Intelligence.jpg",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Our Services
        </h1>
        <p className="text-lg text-slate-600">
          Delivering performance, automation, and reliability to modern logistics.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
