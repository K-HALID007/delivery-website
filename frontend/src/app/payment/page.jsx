'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Banknote, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shipmentData, setShipmentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    // Get shipment data from sessionStorage
    const storedData = sessionStorage.getItem('pendingShipment');
    console.log('Stored data:', storedData);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Parsed data:', parsedData);
        setShipmentData(parsedData);
      } catch (err) {
        console.error('Error parsing shipment data:', err);
        setError('Invalid shipment data');
      }
    } else {
      console.log('No stored data found, redirecting...');
      router.push('/create-shipment');
    }
  }, [router]);

  const calculateShippingCost = () => {
    if (!shipmentData || !shipmentData.packageDetails) return 50;
    
    const { packageDetails } = shipmentData;
    const baseRates = {
      'standard': 50,
      'express': 100,
      'fragile': 80,
      'oversized': 120
    };
    
    let baseCost = baseRates[packageDetails.type] || 50;
    const weightCost = (packageDetails.weight || 1) * 10;
    const dimensions = packageDetails.dimensions || { length: 10, width: 10, height: 10 };
    const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000;
    const volumeCost = volume * 5;
    const distanceCost = 20;
    
    return Math.round(baseCost + weightCost + volumeCost + distanceCost);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('user_token');
      if (!token) {
        setError('Please login first');
        router.push('/');
        return;
      }

      console.log('Creating shipment with data:', shipmentData);
      console.log('Payment method:', paymentMethod);

      // Create shipment with payment information
      const formattedData = {
        ...shipmentData,
        payment: {
          method: paymentMethod
        }
      };

      console.log('Sending to backend:', formattedData);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tracking/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Failed to create shipment' };
        }
        
        console.error('Parsed backend error:', errorData);
        throw new Error(errorData.message || 'Failed to create shipment');
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      const newTrackingId = data.newTrack?.trackingId;
      
      if (!newTrackingId) {
        throw new Error('No tracking ID returned');
      }

      setTrackingId(newTrackingId);
      setSuccess(true);
      
      // Clear the stored data
      sessionStorage.removeItem('pendingShipment');
      
      // Redirect to tracking page after a short delay
      setTimeout(() => {
        router.push(`/track-package?trackingId=${newTrackingId}`);
      }, 3000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while getting shipment data
  if (!shipmentData && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipment Created Successfully!</h1>
            <p className="text-gray-600 mb-4">Your tracking ID: <strong>{trackingId}</strong></p>
            <p className="text-sm text-gray-500">Redirecting to tracking page...</p>
          </div>
        </div>
      </div>
    );
  }

  const shippingCost = calculateShippingCost();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-yellow-600 hover:text-yellow-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipment Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Choose your payment method and complete the shipment creation</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
            
            <form onSubmit={handlePayment}>
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-4">Select Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                    />
                    <Banknote className="h-5 w-5 ml-3 mr-3 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Cash on Delivery (COD)</div>
                      <div className="text-sm text-gray-500">Pay when your package is delivered</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                    />
                    <CreditCard className="h-5 w-5 ml-3 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Online Payment</div>
                      <div className="text-sm text-gray-500">Pay now using UPI, Card, or Net Banking</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Creating Shipment...
                  </div>
                ) : (
                  paymentMethod === 'COD' ? 'Create Shipment (COD)' : `Pay ₹${shippingCost} & Create Shipment`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {shipmentData && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-900">Package Type</span>
                  <span className="font-medium capitalize text-gray-900">{shipmentData.packageDetails?.type || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Weight</span>
                  <span className="font-medium text-gray-900">{shipmentData.packageDetails?.weight || 1} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">From</span>
                  <span className="font-medium text-right text-sm text-gray-900">{shipmentData.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">To</span>
                  <span className="font-medium text-right text-sm text-gray-900">{shipmentData.destination}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{shippingCost}</span>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your shipment will be created after confirming payment method. 
                You'll receive a tracking ID to monitor your package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}