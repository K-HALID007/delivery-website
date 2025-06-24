"use client";
import Tracking from '@/components/tracking/tracking';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import { authService } from '@/services/auth.service';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackPackage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      <Navbar />
      <div className="pt-20"> {/* Add padding-top to account for fixed navbar */}
        <Tracking />
      </div>
      <Footer />
    </>
  );
}
