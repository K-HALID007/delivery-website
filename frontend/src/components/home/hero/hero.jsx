'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginRegisterModal from '../navbar/loginregistermodal';
import { authService } from '@/services/auth.service';

export default function Hero() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleTrackClick = () => {
    if (authService.isAuthenticated()) {
      router.push('/track-package');
    } else {
      setShowModal(true);
    }
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Fixed */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url('/hero/bg-img.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-black/65 z-10" />
      
      {/* Animated subtle pattern overlay for texture */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           linear-gradient(45deg, rgba(255, 193, 7, 0.05) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-16 max-w-7xl">
        {/* Main Content */}
        <div className="flex flex-col items-center text-center text-white font-sans">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-5xl w-full"
          >
            {/* Website Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-wider drop-shadow-lg">
                <span className="text-yellow-400">PRIME</span> DISPATCHER
              </h2>
              <div className="w-32 h-1 bg-yellow-400 mx-auto mt-3 shadow-lg"></div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 drop-shadow-2xl">
              Excellence in <span className="text-yellow-400 drop-shadow-lg">Logistics</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed font-medium mb-8 text-white/95 drop-shadow-lg max-w-4xl mx-auto">
              Your trusted partner for seamless logistics. Track shipments in real-time, receive instant updates, and experience complete visibility of your deliveries worldwide.
            </p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleTrackClick}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1 hover:scale-105 border border-yellow-400/20"
              >
                <span className="flex items-center justify-center gap-2">
                  Track Your Package
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <Link href="/services">
                <button className="group w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <span className="flex items-center justify-center gap-2">
                    Explore Services
                    <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </button>
              </Link>
            </motion.div>
            {showModal && (
              <LoginRegisterModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onLoginSuccess={() => setShowModal(false)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
