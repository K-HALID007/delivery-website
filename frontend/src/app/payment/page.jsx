'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Banknote, ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Package, MapPin, Truck, AlertCircle } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import LoginRegisterModal from '@/components/home/navbar/loginregistermodal';
import { API_URL } from '../../services/api.config.js';
import { toast } from 'react-toastify';

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shipmentData, setShipmentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [trackingId, setTrackingId] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Get shipment data from sessionStorage
    const storedData = sessionStorage.getItem('pendingShipment');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setShipmentData(parsedData);
      } catch (err) {
        console.error('Error parsing shipment data:', err);
        setError('Invalid shipment data');
      }
    } else {
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
    const handlingCost = 20;
    
    return Math.round(baseCost + weightCost + handlingCost);
  };

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('user_token') || sessionStorage.getItem('admin_token');
      
      if (!token) {
        toast.info('Please log in to confirm your booking');
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      // Create shipment with payment information
      const formattedData = {
        ...shipmentData,
        payment: {
          method: paymentMethod
        }
      };

      const response = await fetch(`${API_URL}/tracking/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Failed to create shipment' };
        }
        throw new Error(errorData.message || 'Failed to create shipment');
      }

      const data = await response.json();
      const newTrackingId = data.newTrack?.trackingId;
      
      if (!newTrackingId) {
        throw new Error('No tracking ID returned from server');
      }

      setTrackingId(newTrackingId);
      setSuccess(true);
      toast.success(`Booking Confirmed! Tracking ID: ${newTrackingId}`);
      
      // Clear the pending shipment data
      sessionStorage.removeItem('pendingShipment');
      
      // Redirect to tracking page after 2.5 seconds
      setTimeout(() => {
        router.push(`/track-package?trackingId=${newTrackingId}`);
      }, 2500);

    } catch (err) {
      console.error('Payment error:', err);
      const errText = err.message || 'Payment processing failed';
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    // Continue with payment submission
    handlePayment();
  };

  // Loading state while getting shipment data
  if (!shipmentData && !error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-slate-800 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading order summary...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 pt-32 text-center w-full">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Shipment Confirmed!
            </h1>
            <p className="text-slate-600 text-sm mb-6">
              Your courier has been registered and scheduled for dispatch.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider block mb-1">
                Your Tracking ID
              </span>
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wider">
                {trackingId}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
              <span>Redirecting to live tracking console...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shippingCost = calculateShippingCost();

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Back Button & Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/create-shipment')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4 p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shipment Details
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Prime Courier Booking</span>
              <span>•</span>
              <span className="text-slate-900">Step 2 of 2: Payment & Confirmation</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Booking</h1>
            <p className="text-slate-600 text-sm mt-1">Review shipment details and select payment method to dispatch.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Payment / Creation Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Payment Method Selector (Left) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Select Payment Method</h2>
              <p className="text-xs text-slate-500 mb-6">Choose how you prefer to pay for this shipment</p>
              
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-3">
                  <label
                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mr-3 flex-shrink-0">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Pay in cash or UPI directly when your courier is picked up / delivered.</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">Online Instant Payment</span>
                        <span className="text-xs font-semibold text-slate-500">UPI / Cards / NetBanking</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Instant confirmation with digital invoice receipt.</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs text-slate-600">
                    256-bit encrypted checkout. Tracking link is generated instantly and sent via email/SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Creating Shipment...
                    </>
                  ) : (
                    paymentMethod === 'COD' ? `Confirm & Create Shipment (COD ₹${shippingCost})` : `Pay ₹${shippingCost} & Create Shipment`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary (Right) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Shipment Summary</h2>
                <p className="text-xs text-slate-500 mb-6">Review your consignment details</p>
                
                {shipmentData && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Package className="w-4 h-4 text-amber-500" />
                        <span className="capitalize">{shipmentData.packageDetails?.type || 'Standard'} Mode</span>
                        <span className="text-slate-400">•</span>
                        <span>{shipmentData.packageDetails?.weight || 1} kg</span>
                      </div>
                      {shipmentData.packageDetails?.description && (
                        <p className="text-slate-500 italic">"{shipmentData.packageDetails.description}"</p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Sender (Pickup):</span>
                        <p className="text-slate-900 font-medium">{shipmentData.sender?.name} ({shipmentData.sender?.phone})</p>
                        <p className="text-slate-500 text-[11px]">{shipmentData.origin}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-700 block mb-0.5">Receiver (Delivery):</span>
                        <p className="text-slate-900 font-medium">{shipmentData.receiver?.name} ({shipmentData.receiver?.phone})</p>
                        <p className="text-slate-500 text-[11px]">{shipmentData.destination}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Base Freight Rate</span>
                        <span>₹{shippingCost - 20}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Handling & Insurance Fee</span>
                        <span>₹20</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST (18%)</span>
                        <span className="text-emerald-700 font-medium">Included</span>
                      </div>
                      <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                        <span>Total Payable</span>
                        <span>₹{shippingCost}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Fallback Auth Modal if accessed unauthenticated */}
      <LoginRegisterModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode="register"
        initialData={{
          name: shipmentData?.sender?.name || '',
          email: shipmentData?.sender?.email || '',
          phone: shipmentData?.sender?.phone || ''
        }}
      />

      <Footer />
    </div>
  );
}