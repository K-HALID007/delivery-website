'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import { API_URL } from '../../../services/api.config.js';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState('');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('orderId');
        const order_token = searchParams.get('order_token');
        
        if (!orderId) {
          setError('Order ID not found');
          setLoading(false);
          return;
        }

        const token = sessionStorage.getItem('user_token');
        if (!token) {
          router.push('/');
          return;
        }

        // Verify payment with backend
        const response = await fetch(`${API_URL}/payment/verify/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setPaymentStatus('success');
          setTrackingId(data.data.trackingId);
        } else {
          setPaymentStatus('failed');
          setError(data.message || 'Payment verification failed');
        }

      } catch (err) {
        console.error('Payment verification error:', err);
        setPaymentStatus('failed');
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const handleTrackPackage = () => {
    if (trackingId) {
      router.push(`/track-package?trackingId=${trackingId}`);
    }
  };

  const handleCreateAnother = () => {
    router.push('/create-shipment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Loader className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your payment and create your shipment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your shipment has been created successfully and payment has been processed.
            </p>
            
            {trackingId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 mb-2">Your Tracking ID:</p>
                <p className="text-xl font-bold text-green-900">{trackingId}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleTrackPackage}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center"
              >
                Track Your Package
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              
              <button
                onClick={handleCreateAnother}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Create Another Shipment
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>What's Next?</strong><br />
                • You'll receive email notifications about your shipment status<br />
                • A delivery partner will be assigned automatically<br />
                • You can track your package anytime using the tracking ID
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-lg text-gray-600 mb-6">
              Unfortunately, your payment could not be processed.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => router.push('/payment')}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Try Again
              </button>
              
              <button
                onClick={() => router.push('/create-shipment')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Back to Create Shipment
              </button>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Need Help?</strong><br />
                If you continue to face issues, please contact our support team or try using a different payment method.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Loader className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait while we process your request.</p>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}