'use client';

import { useState } from 'react';
import { X, User, FileText, CheckCircle, Eye, EyeOff, Truck, Mail, Phone, MapPin, CreditCard, Award } from 'lucide-react';

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
    experience: '',
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
      const partnerService = (await import('../../services/partner.service.js')).default;
      const response = await partnerService.login(loginData);
      
      if (response.success) {
        onLoginSuccess();
      }
    } catch (error) {
      setError(error.message);
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
      const partnerService = (await import('../../services/partner.service.js')).default;
      const response = await partnerService.register(registerData);
      
      if (response.success) {
        setSuccess('Registration successful! Please wait for admin approval. You will receive an email confirmation shortly.');
        // Reset form after successful registration
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
      setError(error.message);
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

  // Skeleton Components
  const SkeletonInput = () => (
    <div className="space-y-2">
      <div className="h-4 bg-slate-600 rounded w-24 animate-pulse"></div>
      <div className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>
    </div>
  );

  const SkeletonTextarea = () => (
    <div className="space-y-2">
      <div className="h-4 bg-slate-600 rounded w-32 animate-pulse"></div>
      <div className="h-20 bg-slate-700 rounded-lg animate-pulse"></div>
    </div>
  );

  const SkeletonSelect = () => (
    <div className="space-y-2">
      <div className="h-4 bg-slate-600 rounded w-28 animate-pulse"></div>
      <div className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>
    </div>
  );

  const LoginSkeleton = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-slate-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-slate-600 rounded w-48 mx-auto animate-pulse"></div>
      </div>
      <SkeletonInput />
      <SkeletonInput />
      <div className="h-12 bg-slate-600 rounded-lg animate-pulse"></div>
      <div className="text-center mt-4">
        <div className="h-4 bg-slate-600 rounded w-40 mx-auto animate-pulse"></div>
      </div>
    </div>
  );

  const RegistrationSkeleton = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="h-4 bg-slate-600 rounded w-24 mx-auto mb-4 animate-pulse"></div>
      </div>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-slate-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-slate-600 rounded w-48 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-600 rounded w-32 mx-auto animate-pulse"></div>
      </div>

      {registrationStep === 1 && (
        <>
          <SkeletonInput />
          <SkeletonInput />
          <SkeletonInput />
          <SkeletonInput />
          <SkeletonInput />
        </>
      )}

      {registrationStep === 2 && (
        <>
          <SkeletonTextarea />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonInput />
            <SkeletonInput />
          </div>
          <SkeletonInput />
        </>
      )}

      {registrationStep === 3 && (
        <>
          <SkeletonSelect />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonInput />
            <SkeletonInput />
          </div>
          <SkeletonInput />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonInput />
            <SkeletonInput />
          </div>
        </>
      )}

      <div className="flex gap-3 mt-8">
        {registrationStep > 1 && (
          <div className="flex-1 h-12 bg-slate-600 rounded-lg animate-pulse"></div>
        )}
        <div className="flex-1 h-12 bg-slate-600 rounded-lg animate-pulse"></div>
      </div>

      {registrationStep === 1 && (
        <div className="text-center mt-4">
          <div className="h-4 bg-slate-600 rounded w-40 mx-auto animate-pulse"></div>
        </div>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="text-center mb-6">
      <span className="text-sm text-slate-400">
        Step {registrationStep} of 3
      </span>
    </div>
  );

  const renderRegistrationStep = () => {
    switch (registrationStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
              <p className="text-slate-300">Tell us about yourself</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400 pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Address & Location</h3>
              <p className="text-slate-300">Where will you be operating from?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Address *
              </label>
              <textarea
                name="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                required
                rows="3"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400 resize-none"
                placeholder="Enter your complete address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={registerData.state}
                  onChange={handleRegisterChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                value={registerData.postalCode}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                placeholder="Enter postal code"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Vehicle & Documents</h3>
              <p className="text-slate-300">Final step to complete your registration</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={registerData.vehicleType}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={registerData.vehicleNumber}
                  onChange={handleRegisterChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                  placeholder="e.g., MH12AB1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={registerData.licenseNumber}
                  onChange={handleRegisterChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                  placeholder="Driving license number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Experience
              </label>
              <select
                name="experience"
                value={registerData.experience}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
              >
                <option value="">Select Experience Level</option>
                <option value="0-1">0-1 Years</option>
                <option value="1-3">1-3 Years</option>
                <option value="3-5">3-5 Years</option>
                <option value="5+">5+ Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Working Hours *
              </label>
              <select
                name="workingHours"
                value={registerData.workingHours}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
              >
                <option value="">Select Working Hours</option>
                <option value="morning">Morning (6 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                <option value="evening">Evening (6 PM - 12 AM)</option>
                <option value="flexible">Flexible (Any Time)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={registerData.bankAccount}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                  placeholder="For payments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={registerData.ifscCode}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                  placeholder="Bank IFSC code"
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {activeTab === 'login' ? 'Partner Login' : 'Join as Partner'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'login'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-750'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegistrationStep(1);
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'register'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-750'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {loading ? (
            // Show skeleton screens when loading
            activeTab === 'login' ? <LoginSkeleton /> : <RegistrationSkeleton />
          ) : (
            // Show actual content when not loading
            activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-slate-900" />
                  </div>
                  <p className="text-slate-300">Welcome back! Sign in to your partner account</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-slate-400 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 text-slate-900 py-3 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 font-semibold transition-colors"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-yellow-500 hover:text-yellow-400 text-sm"
                  >
                    Don't have an account? Register here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                {renderStepIndicator()}
                {renderRegistrationStep()}

                <div className="flex gap-3 mt-8">
                  {registrationStep > 1 && (
                    <button
                      type="button"
                      onClick={goBackStep}
                      className="flex-1 bg-slate-600 text-white py-3 px-4 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 font-semibold transition-colors"
                    >
                      Back
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 text-slate-900 py-3 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 font-semibold transition-colors"
                  >
                    {loading ? 'Processing...' : registrationStep === 3 ? 'Complete Registration' : 'Next Step'}
                  </button>
                </div>

                {registrationStep === 1 && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-yellow-500 hover:text-yellow-400 text-sm"
                    >
                      Already have an account? Login here
                    </button>
                  </div>
                )}
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}