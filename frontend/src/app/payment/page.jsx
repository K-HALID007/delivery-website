'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  Check, 
  Download, 
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import LoginRegisterModal from '@/components/home/navbar/loginregistermodal';
import { API_URL } from '../../services/api.config.js';
import { toast } from 'react-toastify';
import { trackingService } from '@/services/tracking.service';

const loadCashfree = () => new Promise((resolve, reject) => {
  if (window.Cashfree) return resolve(window.Cashfree);
  const existing = document.querySelector('script[data-cashfree-sdk]');
  if (existing) {
    existing.addEventListener('load', () => resolve(window.Cashfree), { once: true });
    existing.addEventListener('error', () => reject(new Error('Could not load secure payment checkout')), { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
  script.async = true;
  script.dataset.cashfreeSdk = 'true';
  script.onload = () => resolve(window.Cashfree);
  script.onerror = () => reject(new Error('Could not load secure payment checkout'));
  document.head.appendChild(script);
});

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shipmentData, setShipmentData] = useState(null);
  const [confirmedShipment, setConfirmedShipment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [trackingId, setTrackingId] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('pendingShipment');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setShipmentData(parsedData);
      } catch (err) {
        console.error('Error parsing shipment data:', err);
        setError('Invalid shipment data');
      }
    } else if (!success) {
      router.push('/create-shipment');
    }
  }, [router, success]);

  const calculateShippingCost = () => {
    const dataToUse = shipmentData || confirmedShipment;
    if (!dataToUse || !dataToUse.packageDetails) return 49;
    
    const { packageDetails } = dataToUse;
    const baseRates = {
      standard: 49,
      express: 99,
      fragile: 79,
      oversized: 149
    };
    
    const baseCost = baseRates[packageDetails.type] || 49;
    const w = parseFloat(packageDetails.weight) || 1;
    const extraWeight = Math.max(0, w - 0.5);
    const perKgRate = packageDetails.type === 'express' ? 60 : (packageDetails.type === 'oversized' ? 18 : 30);
    const weightCost = Math.round(extraWeight * perKgRate);
    
    return Math.round(baseCost + weightCost);
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

      if (paymentMethod === 'ONLINE') {
        const sessionResponse = await fetch(`${API_URL}/payment/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ shipmentData })
        });
        const sessionData = await sessionResponse.json();
        if (!sessionResponse.ok || !sessionData.success) {
          throw new Error(sessionData.message || 'Could not start online payment');
        }
        const Cashfree = await loadCashfree();
        if (!Cashfree) throw new Error('Secure payment checkout is unavailable');
        const cashfree = Cashfree({ mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox' });
        const checkout = await cashfree.checkout({
          paymentSessionId: sessionData.data.paymentSessionId,
          redirectTarget: '_self'
        });
        if (checkout?.error) throw new Error(checkout.error.message || 'Could not open payment checkout');
        return;
      }

      const formattedData = { ...shipmentData, payment: { method: 'COD' } };

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
        } catch {
          errorData = { message: errorText || 'Failed to create shipment' };
        }
        throw new Error(errorData.message || 'Failed to create shipment');
      }

      const data = await response.json();
      const newTrackingId = data.newTrack?.trackingId;
      
      if (!newTrackingId) {
        throw new Error('No tracking ID returned from server');
      }

      const totalCost = calculateShippingCost();
      setConfirmedShipment({
        ...formattedData,
        trackingId: newTrackingId,
        totalAmount: totalCost,
        createdAt: new Date().toISOString()
      });

      setTrackingId(newTrackingId);
      setSuccess(true);
      toast.success(`Booking Confirmed! Tracking ID: ${newTrackingId}`);
      sessionStorage.removeItem('pendingShipment');

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
    handlePayment();
  };

  const copyTrackingId = () => {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    toast.success('Tracking ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (!shipmentData && !confirmedShipment && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-6 w-6 text-teal-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUCCESS STATE: Clean & Minimal Confirmation
  // ==========================================
  if (success && (confirmedShipment || shipmentData)) {
    const summary = confirmedShipment || shipmentData;
    const finalCost = summary.totalAmount || calculateShippingCost();

    return (
      <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col justify-between">
        <Navbar />

        <main className="max-w-lg mx-auto px-4 pt-32 pb-20 w-full">
          <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 shadow-xs">
            {/* Minimal Icon & Heading */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Booking Confirmed
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Your shipment has been scheduled for pickup and dispatch.
              </p>
            </div>

            {/* Tracking ID Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 mb-6 min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 block mb-0.5">
                  Tracking ID
                </span>
                <span className="block break-all font-mono text-sm sm:text-lg font-bold text-slate-900 tracking-wide">
                  {trackingId}
                </span>
              </div>
              <button
                type="button"
                onClick={copyTrackingId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5 text-teal-600" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Minimal Route & Summary Details */}
            <div className="space-y-3 py-4 border-t border-b border-slate-100 text-xs">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400">From</span>
                <span className="text-right text-slate-800 font-medium">{summary.sender?.name} • {summary.origin}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400">To</span>
                <span className="text-right text-slate-800 font-medium">{summary.receiver?.name} • {summary.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Package</span>
                <span className="text-slate-800 font-medium capitalize">
                  {summary.packageDetails?.type || 'Standard'} Mode • {summary.packageDetails?.weight || 1} kg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment</span>
                <span className="text-teal-700 font-bold">
                  {paymentMethod === 'COD' ? `Cash on Delivery (₹${finalCost})` : `Paid Online (₹${finalCost})`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => router.push(`/track-package?trackingId=${trackingId}`)}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>Track Live Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => trackingService.downloadInvoice(trackingId).catch((err) => toast.error(err.message))}
                  className="py-2.5 px-3 text-center text-xs font-semibold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/create-shipment')}
                  className="py-2.5 px-3 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                >
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // CHECKOUT STATE: Minimalist Review & Pay
  // ==========================================
  const shippingCost = calculateShippingCost();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full">
        {/* Subtle Back Button */}
        <button
          onClick={() => router.push('/create-shipment')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to shipment form</span>
        </button>

        {/* Minimal Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose your payment method and confirm dispatch.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Payment Method Selector (Left: 7 cols) */}
          <div className="md:col-span-7">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-3">
              Payment Method
            </span>

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Cash on Delivery Radio */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600 shadow-2xs'
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
                {/* Minimal Radio Circle with Teal Active State */}
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                  paymentMethod === 'COD'
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Cash on Delivery</span>
                    <span className="text-xs font-bold text-teal-700">₹{shippingCost}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay in cash or UPI QR upon delivery to the courier agent.
                  </p>
                </div>
              </label>

              {/* Online Payment Radio */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'ONLINE'
                    ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600 shadow-2xs'
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
                {/* Minimal Radio Circle with Teal Active State */}
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                  paymentMethod === 'ONLINE'
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'ONLINE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Pay Online</span>
                    <span className="text-xs font-bold text-teal-700">₹{shippingCost}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instant payment via UPI, Credit/Debit Cards, or NetBanking.
                  </p>
                </div>
              </label>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming booking...</span>
                    </>
                  ) : (
                    <span>
                      {paymentMethod === 'COD' ? `Confirm Booking • ₹${shippingCost}` : `Pay ₹${shippingCost} & Confirm`}
                    </span>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2.5">
                  Secure & verified dispatch confirmation
                </p>
              </div>
            </form>
          </div>

          {/* Consignment Summary (Right: 5 cols) */}
          <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
              Consignment Summary
            </span>

            {shipmentData && (
              <>
                {/* Route */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">From</span>
                    <p className="font-semibold text-slate-900 truncate">
                      {shipmentData.sender?.name}
                    </p>
                    <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                      {shipmentData.origin}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">To</span>
                    <p className="font-semibold text-slate-900 truncate">
                      {shipmentData.receiver?.name}
                    </p>
                    <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                      {shipmentData.destination}
                    </p>
                  </div>
                </div>

                {/* Package Mode */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="capitalize font-medium">{shipmentData.packageDetails?.type || 'Standard'} Mode</span>
                  <span className="font-semibold text-slate-800">{shipmentData.packageDetails?.weight || 1} kg</span>
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Freight charge</span>
                    <span>₹{shippingCost - 20}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Handling & Tax (GST 18%)</span>
                    <span>₹20</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-100 font-bold text-slate-900 text-sm">
                    <span>Total</span>
                    <span className="text-base text-teal-700 font-extrabold">₹{shippingCost}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Fallback Auth Modal */}
      <LoginRegisterModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode="login"
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
