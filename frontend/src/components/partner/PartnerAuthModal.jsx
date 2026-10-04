'use client';

import { useState } from 'react';
import { X, User, CheckCircle, Eye, EyeOff, Truck, Mail, Phone, MapPin, CreditCard, Award, Loader2 } from 'lucide-react';
import partnerService from '../../services/partner.service.js';
import { toast } from 'react-toastify';

export default function PartnerAuthModal({ isOpen, onClose, onLoginSuccess, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    // Step 1: Personal Information
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Step 2: Address & Location
    address: '',
    city: '',
    state: '',
    postalCode: '',
    
    // Step 3: Vehicle & Documents
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    experience: '0-1',
    workingHours: '',
    bankAccount: '',
    ifscCode: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanData = {
        email: loginData.email.trim(),
        password: loginData.password
      };
      const response = await partnerService.login(cleanData);
      
      if (response.success) {
        toast.success(`Welcome back, ${response.partner?.name || 'Driver'}! Redirecting to fleet console...`);
        if (onLoginSuccess) {
          onLoginSuccess(response.partner);
        } else {
          window.location.href = '/partner/dashboard';
        }
        onClose();
      }
    } catch (error) {
      const errText = error.message || 'Login failed. Please check your credentials.';
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registrationStep < 3) {
      // Validate current step
      if (registrationStep === 1) {
        if (!registerData.name || !registerData.email || !registerData.password || !registerData.phone) {
          setError('Please fill in all required fields');
          return;
        }
        if (registerData.phone.includes('@') || registerData.phone.replace(/\D/g, '').length < 10) {
          setError('Please enter a valid 10-digit phone number (digits only, e.g. 9876543210)');
          return;
        }
        if (registerData.password !== registerData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (registerData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
      }
      
      if (registrationStep === 2) {
        if (!registerData.address || !registerData.city || !registerData.state || !registerData.postalCode) {
          setError('Please fill in all address fields');
          return;
        }
      }
      
      setError('');
      setRegistrationStep(registrationStep + 1);
      return;
    }

    // Final step - submit registration
    if (!registerData.vehicleType || !registerData.vehicleNumber || !registerData.licenseNumber || !registerData.workingHours) {
      setError('Please fill in all required vehicle and document details');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...registerData,
        email: registerData.email.trim(),
        experience: registerData.experience || '0-1'
      };
      const response = await partnerService.register(payload);
      
      if (response.success) {
        const succMsg = 'Registration submitted! Please wait for admin verification. You will receive an email confirmation shortly.';
        setSuccess(succMsg);
        toast.success(succMsg);
        setTimeout(() => {
          setRegisterData({
            name: '', email: '', password: '', confirmPassword: '', phone: '',
            address: '', city: '', state: '', postalCode: '',
            vehicleType: '', vehicleNumber: '', licenseNumber: '', experience: '',
            workingHours: '', bankAccount: '', ifscCode: ''
          });
          setRegistrationStep(1);
          setActiveTab('login');
        }, 3000);
      }
    } catch (error) {
      const errText = error.message || 'Registration failed';
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const goBackStep = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
      setError('');
    }
  };

  const inputStyle = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition";

  const renderRegistrationStep = () => {
    switch (registrationStep) {
      case 1:
        return (
          <div className="space-y-3.5">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center mx-auto mb-2 text-teal-700">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Provide your basic contact and identity details</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                className={inputStyle}
                placeholder="Enter your full legal name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                className={inputStyle}
                placeholder="driver@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                required
                className={inputStyle}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  className={`${inputStyle} pr-10`}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                className={inputStyle}
                placeholder="Confirm password"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3.5">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center mx-auto mb-2 text-teal-700">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Address & Hub Location</h3>
              <p className="text-xs text-slate-500">Operating base for delivery route assignments</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Street Address *</label>
              <textarea
                name="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                required
                rows="2"
                className={`${inputStyle} resize-none`}
                placeholder="Complete street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  required
                  className={inputStyle}
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={registerData.state}
                  onChange={handleRegisterChange}
                  required
                  className={inputStyle}
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code *</label>
              <input
                type="text"
                name="postalCode"
                value={registerData.postalCode}
                onChange={handleRegisterChange}
                required
                className={inputStyle}
                placeholder="PIN code"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3.5">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center mx-auto mb-2 text-teal-700">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Vehicle & Bank Details</h3>
              <p className="text-xs text-slate-500">Required for route dispatch and weekly settlements</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Type *</label>
              <select
                name="vehicleType"
                value={registerData.vehicleType}
                onChange={handleRegisterChange}
                required
                className={inputStyle}
              >
                <option value="">Select vehicle type</option>
                <option value="bike">Motorcycle / Bike</option>
                <option value="scooter">Electric Scooter</option>
                <option value="van">Commercial Delivery Van</option>
                <option value="truck">Light Commercial Truck</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle RC Number *</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={registerData.vehicleNumber}
                  onChange={handleRegisterChange}
                  required
                  className={inputStyle}
                  placeholder="MH-02-AB-1234"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Driving License No. *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={registerData.licenseNumber}
                  onChange={handleRegisterChange}
                  required
                  className={inputStyle}
                  placeholder="DL-0420110012"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Experience *</label>
                <select
                  name="experience"
                  value={registerData.experience || '0-1'}
                  onChange={handleRegisterChange}
                  className={inputStyle}
                >
                  <option value="0-1">0 - 1 Years</option>
                  <option value="1-3">1 - 3 Years</option>
                  <option value="3-5">3 - 5 Years</option>
                  <option value="5+">5+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Shifts *</label>
                <select
                  name="workingHours"
                  value={registerData.workingHours}
                  onChange={handleRegisterChange}
                  required
                  className={inputStyle}
                >
                  <option value="">Select shift</option>
                  <option value="morning">Morning (6 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                  <option value="evening">Evening (6 PM - 12 AM)</option>
                  <option value="flexible">Flexible / Full Day</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bank Account</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={registerData.bankAccount}
                  onChange={handleRegisterChange}
                  className={inputStyle}
                  placeholder="Account number"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bank IFSC</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={registerData.ifscCode}
                  onChange={handleRegisterChange}
                  className={inputStyle}
                  placeholder="IFSC code"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {activeTab === 'login' ? 'Partner Portal Sign In' : 'Join as Delivery Partner'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'text-teal-800 border-b-2 border-teal-600 font-semibold bg-teal-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegistrationStep(1);
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'text-teal-800 border-b-2 border-teal-600 font-semibold bg-teal-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg mb-4 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-lg mb-4 text-xs font-medium">
              {success}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-10 h-10 bg-teal-50 border border-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">Sign in with your registered partner credentials</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  className={inputStyle}
                  placeholder="driver@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className={`${inputStyle} pr-10`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-2.5 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 text-sm font-semibold transition shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In to Driver Portal'}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-teal-700 hover:text-teal-900 hover:underline text-xs font-semibold"
                >
                  New driver? Register here
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="text-center mb-4">
                <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                  Step {registrationStep} of 3
                </span>
              </div>

              {renderRegistrationStep()}

              <div className="flex gap-3 mt-6">
                {registrationStep > 1 && (
                  <button
                    type="button"
                    onClick={goBackStep}
                    className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-medium transition"
                  >
                    ← Back
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-600 text-white py-2.5 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 text-xs font-semibold transition shadow-sm"
                >
                  {loading ? 'Submitting...' : registrationStep === 3 ? 'Complete Registration' : 'Next Step →'}
                </button>
              </div>

              {registrationStep === 1 && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-teal-700 hover:text-teal-900 hover:underline text-xs font-semibold"
                  >
                    Already registered? Sign in
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}