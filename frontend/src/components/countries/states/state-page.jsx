'use client';

import { MapPin, Truck, Clock, Shield, Star, Phone, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StatePage({ 
  stateName, 
  countryName, 
  countryPath, 
  cities = [],
  services = []
}) {
  // Using consistent yellow theme for all states to match website
  const currentColor = {
    gradient: 'from-slate-800 to-slate-900',
    text: 'text-yellow-600',
    bg: 'bg-yellow-100',
    textBg: 'text-yellow-800',
    icon: 'text-yellow-500',
    accent: 'text-yellow-400'
  };

  const defaultServices = [
    {
      title: 'Express Delivery',
      description: 'Fast delivery within the state',
      icon: <Truck className={`w-8 h-8 ${currentColor.icon}`} />,
      time: '4-6 Hours'
    },
    {
      title: 'Standard Delivery',
      description: 'Regular delivery service',
      icon: <Clock className={`w-8 h-8 ${currentColor.icon}`} />,
      time: '1-2 Days'
    },
    {
      title: 'Premium Service',
      description: 'Priority handling with tracking',
      icon: <Shield className={`w-8 h-8 ${currentColor.icon}`} />,
      time: '2-3 Hours'
    }
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${currentColor.gradient} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link 
              href={countryPath}
              className="inline-flex items-center text-white hover:text-yellow-400 mb-6 transition-colors text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {countryName}
            </Link>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">
                <span className="text-yellow-400">PRIME</span> DISPATCHER
              </h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Courier Services in <span className="text-yellow-400">{stateName}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto">
              Fast & Reliable Delivery Across {stateName}
            </p>
            <button className="bg-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Get Quote for {stateName}
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Our Services in {stateName}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Professional delivery services across {stateName}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {displayServices.map((service, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 hover:border-yellow-400">
                <div className="flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-center mb-4 leading-relaxed">{service.description}</p>
                <div className="text-center">
                  <span className={`${currentColor.bg} ${currentColor.textBg} px-4 py-2 rounded-full text-sm font-medium`}>
                    {service.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Section */}
      {cities.length > 0 && (
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Cities We Serve in {stateName}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Delivering excellence across major cities</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cities.map((city, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 hover:border-yellow-400">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                      <MapPin className={`w-5 h-5 ${currentColor.icon} mr-2`} />
                      {city.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-slate-600 ml-1">{city.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-600">
                    <span className="font-semibold text-yellow-600">{city.deliveries}</span> successful deliveries
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Help with Your Delivery in {stateName}?</h2>
            <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
              Our dedicated support team is here to assist you with all your delivery needs in {stateName}
            </p>
            <div className="flex flex-col sm:flex-row gap-12 justify-center items-center">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-full mr-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Call Us</p>
                  <p className="text-slate-300">+1 800-123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-full mr-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Email Us</p>
                  <p className="text-slate-300">support@primedispatcher.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}