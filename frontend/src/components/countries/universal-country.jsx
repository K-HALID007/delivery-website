'use client';

import { useState } from 'react';
import { MapPin, Truck, Clock, Shield, Star, Phone, Mail } from 'lucide-react';

export default function UniversalCountryPage({ 
  countryName,
  states = [],
  services = [],
  cities = [],
  phoneNumber = "+1 800-123-4567",
  email = "support@primedispatcher.com"
}) {
  const [selectedState, setSelectedState] = useState('');

  const defaultServices = [
    {
      title: 'Express Delivery',
      description: `Fast delivery across ${countryName}`,
      icon: <Truck className="w-12 h-12 text-yellow-500" />,
      time: '4-6 Hours'
    },
    {
      title: 'Standard Delivery',
      description: 'Regular delivery service',
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      time: '1-2 Days'
    },
    {
      title: 'Premium Service',
      description: 'Priority handling with tracking',
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      time: '2-3 Hours'
    }
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">
                <span className="text-yellow-400">PRIME</span> DISPATCHER
              </h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Courier Services in <span className="text-yellow-400">{countryName}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto">
              Fast, Reliable & Secure Delivery Across {countryName}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {states.length > 0 && (
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-6 py-3 rounded-lg text-gray-800 font-medium min-w-[200px]"
                >
                  <option value="">Select Your {countryName === 'UAE' ? 'Emirate' : countryName === 'Singapore' ? 'Region' : 'State'}</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              )}
              <button className="bg-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Get Quote for {countryName}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Our Services in {countryName}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Professional delivery services tailored for the {countryName} market</p>
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
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
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
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                {countryName === 'UAE' ? 'Emirates' : countryName === 'Singapore' ? 'Areas' : 'Cities'} We Serve
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Delivering excellence across {countryName} with our extensive network</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cities.map((city, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 hover:border-yellow-400">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                      <MapPin className="w-5 h-5 text-yellow-500 mr-2" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Help with Your Delivery?</h2>
            <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
              Our dedicated support team is here to assist you with all your delivery needs in {countryName}
            </p>
            <div className="flex flex-col sm:flex-row gap-12 justify-center items-center">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-full mr-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Call Us</p>
                  <p className="text-slate-300">{phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-full mr-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Email Us</p>
                  <p className="text-slate-300">{email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}