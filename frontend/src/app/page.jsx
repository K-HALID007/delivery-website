import Image from "next/image";
import Navbar from "@/components/home/navbar/navbar";
import HeroSection from "@/components/home/hero/hero";
import Features from "@/components/home/features/features"; 
import Footer from "@/components/home/footer/footer";
export default function Home() {
  return (
    <>
    <Navbar/>
    <HeroSection/>
    <Features/>
    <Footer/>
  </>
  );
}
