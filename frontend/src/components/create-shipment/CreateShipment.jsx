'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Clock,
  Lock
} from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import LoginRegisterModal from '@/components/home/navbar/loginregistermodal';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';

export default function CreateShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register');

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderPostalCode: '',
    senderCountry: 'India',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    receiverCity: '',
    receiverState: '',
    receiverPostalCode: '',
    receiverCountry: 'India',
    packageType: 'standard',
    weight: '1.0',
    description: '',
    specialInstructions: ''
  });

  // Restore draft or prefill logged-in user on mount
  useEffect(() => {
    // 1. Check if draft exists in sessionStorage
    const savedDraft = sessionStorage.getItem('draft_shipment_form');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error('Failed to parse draft shipment:', err);
      }
    }

    // 2. Check authenticated user
    const syncUser = () => {
      let user = null;
      try {
        user = authService.getCurrentUser() || 
          JSON.parse(sessionStorage.getItem('user_user') || sessionStorage.getItem('admin_user') || 'null');
      } catch (e) {
        user = null;
      }

      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          senderName: prev.senderName || user.name || '',
          senderEmail: prev.senderEmail || user.email || '',
          senderPhone: prev.senderPhone || user.phone || '',
          senderAddress: prev.senderAddress || user.address || '',
          senderCity: prev.senderCity || user.city || '',
          senderState: prev.senderState || user.state || '',
          senderPostalCode: prev.senderPostalCode || user.postalCode || '',
          senderCountry: prev.senderCountry || user.country || 'India'
        }));
      } else {
        setCurrentUser(null);
      }
    };

    syncUser();

    const handleAuthChange = () => syncUser();
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Save draft into sessionStorage continuously so user never loses their data
      sessionStorage.setItem('draft_shipment_form', JSON.stringify(updated));
      return updated;
    });
  };

  const calculateEstimate = () => {
    const rates = {
      standard: 50,
      express: 100,
      fragile: 80,
      oversized: 120
    };
    const base = rates[formData.packageType] || 50;
    const w = parseFloat(formData.weight) || 1;
    const weightAddon = Math.round(w * 10);
    const handling = 20;
    return base + weightAddon + handling;
  };

  const proceedToPayment = (shipmentPayload) => {
    setLoading(true);
    try {
      const formattedData = {
        sender: {
          name: shipmentPayload.senderName,
          email: shipmentPayload.senderEmail,
          phone: shipmentPayload.senderPhone
        },
        receiver: {
          name: shipmentPayload.receiverName,
          email: shipmentPayload.receiverEmail,
          phone: shipmentPayload.receiverPhone
        },
        origin: `${shipmentPayload.senderAddress}, ${shipmentPayload.senderCity}, ${shipmentPayload.senderState} ${shipmentPayload.senderPostalCode}, ${shipmentPayload.senderCountry}`,
        destination: `${shipmentPayload.receiverAddress}, ${shipmentPayload.receiverCity}, ${shipmentPayload.receiverState} ${shipmentPayload.receiverPostalCode}, ${shipmentPayload.receiverCountry}`,
        status: 'Pending',
        currentLocation: 'Not Updated',
        packageDetails: {
          type: shipmentPayload.packageType,
          weight: parseFloat(shipmentPayload.weight) || 1,
          description: shipmentPayload.description,
          specialInstructions: shipmentPayload.specialInstructions
        }
      };

      sessionStorage.setItem('pendingShipment', JSON.stringify(formattedData));
      sessionStorage.removeItem('draft_shipment_form');
      toast.success('Shipment details verified! Proceeding to payment...');
      router.push('/payment');
    } catch (err) {
      const errText = err.message || 'Failed to prepare shipment';
      setError(errText);
      toast.error(errText);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Ensure draft is saved
    sessionStorage.setItem('draft_shipment_form', JSON.stringify(formData));

    const token = sessionStorage.getItem('user_token') || 
                  sessionStorage.getItem('admin_token') || 
                  authService.getToken();

    if (!token) {
      // User is not logged in: Prompt modal without kicking them away or clearing form!
      toast.info('Please sign in or register to complete your courier booking');
      setAuthModalMode('register');
      setShowAuthModal(true);
      return;
    }

    proceedToPayment(formData);
  };

  const handleLoginSuccess = (user) => {
    setShowAuthModal(false);
    setCurrentUser(user);

    // Merge user information with entered form data
    const updatedForm = {
      ...formData,
      senderName: formData.senderName || user.name || '',
      senderEmail: user.email || formData.senderEmail || '',
      senderPhone: formData.senderPhone || user.phone || '',
      senderAddress: formData.senderAddress || user.address || '',
      senderCity: formData.senderCity || user.city || '',
      senderState: formData.senderState || user.state || '',
      senderPostalCode: formData.senderPostalCode || user.postalCode || '',
      senderCountry: formData.senderCountry || user.country || 'India'
    };

    setFormData(updatedForm);
    // Directly proceed with all filled data intact
    proceedToPayment(updatedForm);
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all hover:border-slate-400";
  const labelClasses = "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-3">
            <Package className="w-3.5 h-3.5 text-amber-500" />
            <span>Prime Courier Booking</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-700 font-bold">Step 1 of 2</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Book a Courier
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">
            Fill in pickup, destination, and package details. Real-time end-to-end tracking is included automatically with every shipment.
          </p>

          {/* Auth State Guidance Banner */}
          <div className="mt-6 p-4 rounded-xl border transition-all duration-200">
            {currentUser ? (
              <div className="flex items-center justify-between flex-wrap gap-3 bg-emerald-50/80 border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Signed in as <strong>{currentUser.name}</strong> ({currentUser.email}). Sender details are synced with your profile.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3 bg-white border-slate-200/90 shadow-sm px-4 py-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Guest Booking Available</p>
                    <p className="text-xs text-slate-600 font-medium">
                      You can fill out the complete booking form freely. You'll be prompted to sign in or create an account right before payment — all entered data will be preserved!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-semibold text-slate-900 hover:text-amber-600 border border-slate-300 px-3 py-1.5 rounded-lg hover:border-slate-400 bg-white transition"
                >
                  Already have an account? Sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Unable to proceed</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Row 1: Sender & Receiver */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sender Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Sender Details (Pickup)</h2>
                    <p className="text-xs text-slate-600 font-medium">Who is dispatching this package</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">Origin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Full Name *</label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Phone Number *</label>
                  <input
                    type="tel"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. +91 98765 43210"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Email Address *</label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleChange}
                    required
                    placeholder="rahul@example.com"
                    className={inputClasses}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClasses}>Street Address *</label>
                  <input
                    type="text"
                    name="senderAddress"
                    value={formData.senderAddress}
                    onChange={handleChange}
                    required
                    placeholder="House/Office no, building, street"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>City *</label>
                  <input
                    type="text"
                    name="senderCity"
                    value={formData.senderCity}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Mumbai"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>State / Province *</label>
                  <input
                    type="text"
                    name="senderState"
                    value={formData.senderState}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Maharashtra"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Postal / PIN Code *</label>
                  <input
                    type="text"
                    name="senderPostalCode"
                    value={formData.senderPostalCode}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 400001"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Country *</label>
                  <input
                    type="text"
                    name="senderCountry"
                    value={formData.senderCountry}
                    onChange={handleChange}
                    required
                    placeholder="India"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Receiver Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Truck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Receiver Details (Delivery)</h2>
                    <p className="text-xs text-slate-600 font-medium">Destination address & recipient</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">Destination</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Recipient Full Name *</label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Priya Patel"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Phone Number *</label>
                  <input
                    type="tel"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. +91 91234 56789"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Email Address *</label>
                  <input
                    type="email"
                    name="receiverEmail"
                    value={formData.receiverEmail}
                    onChange={handleChange}
                    required
                    placeholder="priya@example.com"
                    className={inputClasses}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClasses}>Delivery Street Address *</label>
                  <input
                    type="text"
                    name="receiverAddress"
                    value={formData.receiverAddress}
                    onChange={handleChange}
                    required
                    placeholder="Apt/Flat no, building, road"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>City *</label>
                  <input
                    type="text"
                    name="receiverCity"
                    value={formData.receiverCity}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Bengaluru"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>State / Province *</label>
                  <input
                    type="text"
                    name="receiverState"
                    value={formData.receiverState}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Karnataka"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Postal / PIN Code *</label>
                  <input
                    type="text"
                    name="receiverPostalCode"
                    value={formData.receiverPostalCode}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 560001"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Country *</label>
                  <input
                    type="text"
                    name="receiverCountry"
                    value={formData.receiverCountry}
                    onChange={handleChange}
                    required
                    placeholder="India"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Package Specifications & Delivery Mode */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Package & Service Type</h2>
                  <p className="text-xs text-slate-600 font-medium">Specify package weight and handling preferences</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Delivery Speed / Type */}
              <div className="md:col-span-2">
                <label className={labelClasses}>Shipping Service Mode *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'standard', name: 'Standard Delivery', time: '3 - 5 Business Days', base: '₹50 base' },
                    { id: 'express', name: 'Express Priority', time: '1 - 2 Business Days', base: '₹100 base' },
                    { id: 'fragile', name: 'Fragile / Safe Care', time: 'Insured Handling', base: '₹80 base' },
                    { id: 'oversized', name: 'Heavy & Oversized', time: 'Freight Transit', base: '₹120 base' }
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.packageType === mode.id
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="packageType"
                        value={mode.id}
                        checked={formData.packageType === mode.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">{mode.name}</span>
                        <span className="text-xs font-bold text-slate-700">{mode.base}</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        {mode.time}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weight in KG */}
              <div>
                <label className={labelClasses}>Total Weight (KG) *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="0.1"
                    step="0.1"
                    placeholder="1.0"
                    className={`${inputClasses} pr-12 text-base font-semibold`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700">
                    KG
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 font-medium">
                  Rate is dynamically calculated at ₹10 per KG plus handling.
                </p>

                {/* Live Cost Box */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
                    <span>Estimated Shipping:</span>
                    <span className="font-bold text-slate-900">₹{calculateEstimate()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>GST & Handling:</span>
                    <span className="font-bold text-slate-900">Included</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Total Approx:</span>
                    <span className="text-base font-extrabold text-slate-900">₹{calculateEstimate()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
              <div>
                <label className={labelClasses}>Package Contents Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g. Legal documents, clothing apparel, or electronics..."
                  className={`${inputClasses} resize-none`}
                />
                <p className="mt-1.5 text-xs text-slate-600 font-medium">Brief summary of items inside the box.</p>
              </div>

              <div>
                <label className={labelClasses}>Special Instructions (Optional)</label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g. Please ring doorbell twice, handle with delicate care, fragile item..."
                  className={`${inputClasses} resize-none`}
                />
                <p className="mt-1.5 text-xs text-slate-600 font-medium">Delivery notes for courier pickup agent.</p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Insured & Tamper-Proof Guarantee</p>
                <p className="text-xs text-slate-600 font-medium">Real-time GPS tracking and SMS/Email delivery updates included.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Auth Modal Triggered on Submit if Guest */}
      <LoginRegisterModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
        initialData={{
          name: formData.senderName,
          email: formData.senderEmail,
          phone: formData.senderPhone,
          address: formData.senderAddress,
          city: formData.senderCity,
          state: formData.senderState,
          postalCode: formData.senderPostalCode,
          country: formData.senderCountry
        }}
      />

      <Footer />
    </div>
  );
}