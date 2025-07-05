'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User, Phone, Mail, Truck } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';

export default function CreateShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderPostalCode: '',
    senderCountry: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    receiverCity: '',
    receiverState: '',
    receiverPostalCode: '',
    receiverCountry: '',
    packageType: 'standard',
    weight: '',
    description: '',
    specialInstructions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('user_token');
      if (!token) {
        router.push('/');
        return;
      }

      // Format the data for the payment page
      const formattedData = {
        sender: {
          name: formData.senderName,
          email: formData.senderEmail,
          phone: formData.senderPhone
        },
        receiver: {
          name: formData.receiverName,
          email: formData.receiverEmail,
          phone: formData.receiverPhone
        },
        origin: `${formData.senderAddress}, ${formData.senderCity}, ${formData.senderState} ${formData.senderPostalCode}, ${formData.senderCountry}`,
        destination: `${formData.receiverAddress}, ${formData.receiverCity}, ${formData.receiverState} ${formData.receiverPostalCode}, ${formData.receiverCountry}`,
        status: 'Pending',
        currentLocation: 'Not Updated',
        packageDetails: {
          type: formData.packageType,
          weight: parseFloat(formData.weight),
          description: formData.description,
          specialInstructions: formData.specialInstructions
        }
      };

      // Store shipment data and redirect to payment page
      sessionStorage.setItem('pendingShipment', JSON.stringify(formattedData));
      router.push('/payment');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
  <Navbar />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
  <div className="text-center mb-16">
  <h1 className="text-5xl font-bold text-slate-700 mb-6">Create New Shipment</h1>
  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
  Fill in the comprehensive details below to create your shipment. We ensure secure processing and real-time tracking for all your packages.
  </p>
  </div>
  
  <form onSubmit={handleSubmit} className="w-full space-y-16">
  {error && (
  <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
  <p className="text-red-800 font-medium">{error}</p>
  </div>
  )}
  
  {/* First Row: Sender and Receiver */}
  <div className="flex flex-col lg:flex-row gap-12 mb-16">
  {/* Left: Sender */}
  <div className="flex-1 min-w-0">
  {/* Sender Information */}
  <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
  <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
  <User className="h-7 w-7 mr-3 text-yellow-500" />
  Sender Information
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Full Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  required
                  placeholder="Enter sender's complete full name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-slate-900 text-base hover:border-slate-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Phone Number</label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  required
                  placeholder="Enter sender's contact phone number"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-slate-900 text-base hover:border-slate-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Email Address</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter sender's email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Street Address</label>
                <input
                  type="text"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete street address with house number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">City</label>
                <input
                  type="text"
                  name="senderCity"
                  value={formData.senderCity}
                  onChange={handleChange}
                  required
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">State/Province</label>
                <input
                  type="text"
                  name="senderState"
                  value={formData.senderState}
                  onChange={handleChange}
                  required
                  placeholder="Enter state or province"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Postal Code</label>
                <input
                  type="text"
                  name="senderPostalCode"
                  value={formData.senderPostalCode}
                  onChange={handleChange}
                  required
                  placeholder="Enter postal or zip code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Country</label>
                <input
                  type="text"
                  name="senderCountry"
                  value={formData.senderCountry}
                  onChange={handleChange}
                  required
                  placeholder="Enter country name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>
            </div>

            {/* Right: Receiver */}
            <div className="flex-1 min-w-0">
              {/* Receiver Information */}
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
                  <Truck className="h-7 w-7 mr-3 text-yellow-500" />
                  Receiver Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Full Name</label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver's complete full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Phone Number</label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver's contact phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Email Address</label>
                <input
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver's email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Street Address</label>
                <input
                  type="text"
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete street address with house number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">City</label>
                <input
                  type="text"
                  name="receiverCity"
                  value={formData.receiverCity}
                  onChange={handleChange}
                  required
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">State/Province</label>
                <input
                  type="text"
                  name="receiverState"
                  value={formData.receiverState}
                  onChange={handleChange}
                  required
                  placeholder="Enter state or province"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Postal Code</label>
                <input
                  type="text"
                  name="receiverPostalCode"
                  value={formData.receiverPostalCode}
                  onChange={handleChange}
                  required
                  placeholder="Enter postal or zip code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Country</label>
                <input
                  type="text"
                  name="receiverCountry"
                  value={formData.receiverCountry}
                  onChange={handleChange}
                  required
                  placeholder="Enter country name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
              </div>
            </div>
          </div>

          {/* Package Information - Full Width */}
          <div className="w-full">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
                <Package className="h-7 w-7 mr-3 text-yellow-500" />
                Package Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Package Type</label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                  >
                    <option value="" disabled className="text-gray-900">Select package type</option>
                    <option value="standard" className="text-gray-900">Standard Delivery (3-5 days)</option>
                    <option value="express" className="text-gray-900">Express Delivery (1-2 days)</option>
                    <option value="fragile" className="text-gray-900">Fragile Items (Special Handling)</option>
                    <option value="oversized" className="text-gray-900">Oversized Items (Special Handling)</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-600">Choose the appropriate delivery type for your package</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    placeholder="Enter package weight in kilograms"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                  />
                  <p className="mt-2 text-sm text-gray-600">Enter weight in kilograms (e.g., 2.5) - Price will be calculated based on weight</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information - Full Width */}
          <div className="w-full">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
                <MapPin className="h-7 w-7 mr-3 text-yellow-500" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Package Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Provide a detailed description of your package contents (e.g., 'Electronics - Laptop and accessories', 'Clothing - Winter jackets and boots', 'Documents - Legal contracts and certificates')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-600">Provide a clear and detailed description of the package contents for customs and handling purposes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Special Instructions</label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Add any special handling instructions or delivery requirements (e.g., 'Handle with extreme care - fragile electronics', 'Keep upright at all times', 'Temperature sensitive - avoid heat', 'Signature required upon delivery')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-600">Add any special handling requirements or delivery instructions to ensure safe transport</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-6 mt-16 pt-8 border-t border-slate-200">
          <button
          type="button"
          onClick={() => router.push('/my-shipments')}
          className="px-8 py-4 border-2 border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
          >
          Cancel
          </button>
          <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
          {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
          </div>
          </form>
          </div>
          </div>
          );
          }