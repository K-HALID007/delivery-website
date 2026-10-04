import Navbar from "@/components/home/navbar/navbar";
import Hero from "@/components/home/hero/hero";
import TrackingShowcase from "@/components/home/tracking/TrackingShowcase";
import HomeServices from "@/components/home/services/HomeServices";
import Features from "@/components/home/features/features";
import HomePricing from "@/components/home/pricing/HomePricing";
import HomePartner from "@/components/home/partner/HomePartner";
import HomeTestimonials from "@/components/home/testimonials/HomeTestimonials";
import HomeFaq from "@/components/home/faq/HomeFaq";
import HomeContact from "@/components/home/contact/HomeContact";
import Footer from "@/components/home/footer/footer";

export const metadata = {
  title: "Prime Dispatcher - Lightning-Fast Express Delivery & Real-Time Tracking",
  description: "Next-generation courier, freight, and hyper-local delivery network. Track packages in real-time, calculate shipping rates, and schedule door-to-door pickups effortlessly.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-teal-500/20 selection:text-teal-900">
      <Navbar />
      <Hero />
      <TrackingShowcase />
      <HomeServices />
      <Features />
      <HomePricing />
      <HomePartner />
      <HomeTestimonials />
      <HomeFaq />
      <HomeContact />
      <Footer />
    </main>
  );
}
