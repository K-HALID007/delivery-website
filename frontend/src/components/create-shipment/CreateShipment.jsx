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
  Lock,
  Building2,
  Navigation,
  Compass,
  Globe,
  RotateCcw
} from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import Footer from '@/components/home/footer/footer';
import LoginRegisterModal from '@/components/home/navbar/loginregistermodal';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';

// Safely extract clean scalar address strings from user object, avoiding [object Object]
const extractSenderAddress = (user) => {
  if (!user) return { street: '', city: '', state: '', postalCode: '', country: 'India' };

  let street = '';
  let city = user.city || '';
  let state = user.state || '';
  let postalCode = user.postalCode || '';
  let country = user.country || 'India';

  if (user.address) {
    if (typeof user.address === 'object' && user.address !== null) {
      street = user.address.street || '';
      city = user.address.city || city || '';
      state = user.address.state || state || '';
      postalCode = user.address.postalCode || postalCode || '';
      country = user.address.country || country || 'India';
    } else if (typeof user.address === 'string' && user.address !== '[object Object]') {
      street = user.address;
    }
  }

  if (street === '[object Object]') street = '';

  return { street, city, state, postalCode, country };
};

const sanitizeAddressValue = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    return val.street || '';
  }
  const str = String(val).trim();
  if (str === '[object Object]') return '';
  return str;
};

const initialFormState = {
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
};

export default function CreateShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register');

  const [formData, setFormData] = useState(initialFormState);

  // Restore draft or prefill logged-in user on mount
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    const user = isAuth ? authService.getCurrentUser() : null;

    if (user) {
      setCurrentUser(user);
      const addr = extractSenderAddress(user);

      // Check draft for logged-in user
      const savedDraft = sessionStorage.getItem('draft_shipment_form');
      let parsed = {};
      if (savedDraft) {
        try {
          parsed = JSON.parse(savedDraft) || {};
        } catch (e) {
          parsed = {};
        }
      }

      setFormData(prev => ({
        ...prev,
        ...parsed,
        // Prefill sender from user profile, ensuring never [object Object]
        senderName: parsed.senderName || user.name || '',
        senderEmail: parsed.senderEmail || user.email || '',
        senderPhone: parsed.senderPhone || user.phone || '',
        senderAddress: sanitizeAddressValue(parsed.senderAddress) || addr.street,
        senderCity: parsed.senderCity || addr.city,
        senderState: parsed.senderState || addr.state,
        senderPostalCode: parsed.senderPostalCode || addr.postalCode,
        senderCountry: parsed.senderCountry || addr.country || 'India',
        receiverAddress: sanitizeAddressValue(parsed.receiverAddress)
      }));
    } else {
      // User is LOGGED OUT: Sender info must be clean/blank. Never prefill.
      setCurrentUser(null);
      sessionStorage.removeItem('draft_shipment_form');

      setFormData(prev => ({
        ...prev,
        senderName: '',
        senderPhone: '',
        senderEmail: '',
        senderAddress: '',
        senderCity: '',
        senderState: '',
        senderPostalCode: '',
        senderCountry: 'India'
      }));
    }

    // Listen to login/logout events
    const handleAuthChange = (e) => {
      const isNowAuth = e?.detail?.isAuthenticated ?? authService.isAuthenticated();
      const nowUser = e?.detail?.user ?? (isNowAuth ? authService.getCurrentUser() : null);

      if (!isNowAuth || !nowUser) {
        // User logged out: clear sender form data and stored draft immediately
        setCurrentUser(null);
        sessionStorage.removeItem('draft_shipment_form');
        sessionStorage.removeItem('pendingShipment');
        setFormData(prev => ({
          ...prev,
          senderName: '',
          senderPhone: '',
          senderEmail: '',
          senderAddress: '',
          senderCity: '',
          senderState: '',
          senderPostalCode: '',
          senderCountry: 'India'
        }));
      } else {
        // User logged in: sync user details
        setCurrentUser(nowUser);
        const addr = extractSenderAddress(nowUser);
        setFormData(prev => ({
          ...prev,
          senderName: nowUser.name || prev.senderName || '',
          senderEmail: nowUser.email || prev.senderEmail || '',
          senderPhone: nowUser.phone || prev.senderPhone || '',
          senderAddress: addr.street || sanitizeAddressValue(prev.senderAddress),
          senderCity: addr.city || prev.senderCity,
          senderState: addr.state || prev.senderState,
          senderPostalCode: addr.postalCode || prev.senderPostalCode,
          senderCountry: addr.country || prev.senderCountry || 'India'
        }));
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Save draft into sessionStorage
      sessionStorage.setItem('draft_shipment_form', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearForm = () => {
    sessionStorage.removeItem('draft_shipment_form');
    sessionStorage.removeItem('pendingShipment');
    setFormData(initialFormState);
    toast.info('Shipment form cleared');
  };

  const fillFromProfile = () => {
    if (!currentUser) return;
    const addr = extractSenderAddress(currentUser);
    setFormData(prev => {
      const updated = {
        ...prev,
        senderName: currentUser.name || '',
        senderEmail: currentUser.email || '',
        senderPhone: currentUser.phone || '',
        senderAddress: addr.street,
        senderCity: addr.city,
        senderState: addr.state,
        senderPostalCode: addr.postalCode,
        senderCountry: addr.country || 'India'
      };
      sessionStorage.setItem('draft_shipment_form', JSON.stringify(updated));
      return updated;
    });
    toast.success('Sender details synced from profile');
  };

  const calculateEstimate = () => {
    const rates = {
      standard: 49,
      express: 99,
      fragile: 79,
      oversized: 149
    };
    const base = rates[formData.packageType] || 49;
    const w = parseFloat(formData.weight) || 1;
    const extraWeight = Math.max(0, w - 0.5);
    const perKgRate = formData.packageType === 'express' ? 60 : (formData.packageType === 'oversized' ? 18 : 30);
    const weightAddon = Math.round(extraWeight * perKgRate);
    return base + weightAddon;
  };

  const proceedToPayment = (shipmentPayload) => {
    setLoading(true);
    try {
      const cleanSenderAddr = sanitizeAddressValue(shipmentPayload.senderAddress);
      const cleanReceiverAddr = sanitizeAddressValue(shipmentPayload.receiverAddress);

      const originParts = [
        cleanSenderAddr,
        shipmentPayload.senderCity,
        shipmentPayload.senderState ? `${shipmentPayload.senderState} ${shipmentPayload.senderPostalCode || ''}`.trim() : shipmentPayload.senderPostalCode,
        shipmentPayload.senderCountry || 'India'
      ].filter(Boolean);

      const destParts = [
        cleanReceiverAddr,
        shipmentPayload.receiverCity,
        shipmentPayload.receiverState ? `${shipmentPayload.receiverState} ${shipmentPayload.receiverPostalCode || ''}`.trim() : shipmentPayload.receiverPostalCode,
        shipmentPayload.receiverCountry || 'India'
      ].filter(Boolean);

      const formattedData = {
        sender: {
          name: shipmentPayload.senderName || '',
          email: shipmentPayload.senderEmail || '',
          phone: shipmentPayload.senderPhone || ''
        },
        receiver: {
          name: shipmentPayload.receiverName || '',
          email: shipmentPayload.receiverEmail || '',
          phone: shipmentPayload.receiverPhone || ''
        },
        origin: originParts.join(', '),
        destination: destParts.join(', '),
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

    const token = typeof window !== 'undefined'
      ? (sessionStorage.getItem('user_token') || sessionStorage.getItem('admin_token') || (typeof authService.getToken === 'function' ? authService.getToken() : null))
      : null;

    if (!token) {
      // User is not logged in: Prompt login modal without clearing form!
      toast.info('Please sign in or register to complete your courier booking');
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }

    proceedToPayment(formData);
  };

  const handleLoginSuccess = (user) => {
    setShowAuthModal(false);
    setCurrentUser(user);

    const addr = extractSenderAddress(user);

    // Merge user information with entered form data safely
    const updatedForm = {
      ...formData,
      senderName: formData.senderName || user.name || '',
      senderEmail: user.email || formData.senderEmail || '',
      senderPhone: formData.senderPhone || user.phone || '',
      senderAddress: sanitizeAddressValue(formData.senderAddress) || addr.street,
      senderCity: formData.senderCity || addr.city,
      senderState: formData.senderState || addr.state,
      senderPostalCode: formData.senderPostalCode || addr.postalCode,
      senderCountry: formData.senderCountry || addr.country || 'India'
    };

    setFormData(updatedForm);
    sessionStorage.setItem('draft_shipment_form', JSON.stringify(updatedForm));
    proceedToPayment(updatedForm);
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition shadow-2xs hover:border-slate-400 font-normal";
  const labelClasses = "block text-xs font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-3">
                <Package className="w-3.5 h-3.5 text-teal-600" />
                <span>Prime Courier Booking</span>
                <span className="text-teal-400">•</span>
                <span className="text-teal-900 font-bold">Step 1 of 2</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Book a Courier
              </h1>
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Fill in pickup, destination, and package details. Real-time end-to-end tracking is included automatically with every shipment.
              </p>
            </div>

            <div className="self-start sm:self-center">
              <button
                type="button"
                onClick={handleClearForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
                title="Reset all form fields"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear Form</span>
              </button>
            </div>
          </div>

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
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
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
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 border border-slate-300 px-3 py-1.5 rounded-lg hover:border-slate-400 bg-white transition shadow-2xs"
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
          {/* Row 1: Sender & Receiver Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Sender Information Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Pickup Information (Sender)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentUser 
                      ? 'Synced with your account profile (editable below)'
                      : 'Enter pickup contact and doorstep address'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser && (
                    <button
                      type="button"
                      onClick={fillFromProfile}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 border border-teal-200/80 px-2.5 py-1 rounded-md transition"
                      title="Refill sender details from your profile"
                    >
                      Re-sync Profile
                    </button>
                  )}
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                    Origin
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Full Name <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    Mobile Phone <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="tel"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Email Address <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    Street Address / Floor / Landmark <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="senderAddress"
                    value={sanitizeAddressValue(formData.senderAddress)}
                    onChange={handleChange}
                    required
                    placeholder="Flat/Office No, Building name, Landmark, Street"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    City <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    State <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    Postal / PIN Code <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="senderPostalCode"
                    value={formData.senderPostalCode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    placeholder="e.g. 400001"
                    className={`${inputClasses} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Country <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="senderCountry"
                    value={formData.senderCountry}
                    onChange={handleChange}
                    required
                    placeholder="India"
                    className={`${inputClasses} bg-slate-50 cursor-default`}
                  />
                </div>
              </div>
            </div>

            {/* Receiver Information Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Delivery Information (Recipient)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Destination address and recipient contact details</p>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                  Destination
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Recipient Full Name <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    Recipient Mobile <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="tel"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    required
                    placeholder="+91 91234 56789"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Email Address <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    Delivery Street Address / Floor / Flat <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiverAddress"
                    value={sanitizeAddressValue(formData.receiverAddress)}
                    onChange={handleChange}
                    required
                    placeholder="Apt/Flat/Office No, Building name, Road"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    City <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    State <span className="text-teal-700">*</span>
                  </label>
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
                  <label className={labelClasses}>
                    Postal / PIN Code <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiverPostalCode"
                    value={formData.receiverPostalCode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    placeholder="e.g. 560001"
                    className={`${inputClasses} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Country <span className="text-teal-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="receiverCountry"
                    value={formData.receiverCountry}
                    onChange={handleChange}
                    required
                    placeholder="India"
                    className={`${inputClasses} bg-slate-50 cursor-default`}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Package Specifications & Delivery Mode */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Package Specifications & Service Mode</h2>
                <p className="text-xs text-slate-500 mt-0.5">Specify consignment weight, service tier, and handling</p>
              </div>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                Specifications
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Delivery Speed / Type */}
              <div className="md:col-span-2">
                <label className={labelClasses}>Shipping Service Mode *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'standard', name: 'Standard Ground', time: '2 - 4 Business Days', base: '₹49 base' },
                    { id: 'express', name: 'Express Priority Air', time: 'Guaranteed 24 Hours', base: '₹99 base' },
                    { id: 'fragile', name: 'Fragile / Safe Care', time: 'Insured Padded Handling', base: '₹79 base' },
                    { id: 'oversized', name: 'Heavy & Oversized', time: 'Dedicated Freight', base: '₹149 base' }
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.packageType === mode.id
                          ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600 shadow-2xs'
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
                        <span className="text-xs font-bold text-teal-700">{mode.base}</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
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
                  500g base slab + pro-rated weight. GST & insurance included.
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
                    <span className="text-base font-extrabold text-teal-700">₹{calculateEstimate()}</span>
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
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Insured & Tamper-Proof Guarantee</p>
                <p className="text-xs text-slate-500 font-medium">Real-time GPS tracking and SMS/Email delivery updates included.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
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