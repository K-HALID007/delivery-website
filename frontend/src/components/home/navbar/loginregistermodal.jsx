"use client";

import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, Building, Globe, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

const LoginRegisterModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - strict validation
    if (name === 'phone') {
      // Remove all non-digit characters for counting
      const digitsOnly = value.replace(/\D/g, '');
      
      // Only allow input if it doesn't exceed 15 digits
      if (digitsOnly.length <= 15) {
        // Allow only digits, spaces, hyphens, plus signs, and parentheses
        const allowedChars = /^[\d\s\-\+\(\)]*$/;
        if (allowedChars.test(value)) {
          setFormData(prev => ({
            ...prev,
            [name]: value
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError('');
  };

  // Strict validation function with enhanced phone validation
  const validateRegistrationForm = () => {
    const errors = [];
    
    // Check all required fields
    if (!formData.name || formData.name.trim() === '') errors.push('Full name');
    if (!formData.email || formData.email.trim() === '') errors.push('Email');
    if (!formData.password || formData.password === '') errors.push('Password');
    if (!formData.confirmPassword || formData.confirmPassword === '') errors.push('Confirm password');
    if (!formData.phone || formData.phone.trim() === '') errors.push('Phone number');
    if (!formData.address || formData.address.trim() === '') errors.push('Street address');
    if (!formData.city || formData.city.trim() === '') errors.push('City');
    if (!formData.state || formData.state.trim() === '') errors.push('State/Province');
    if (!formData.postalCode || formData.postalCode.trim() === '') errors.push('Postal code');
    if (!formData.country || formData.country.trim() === '') errors.push('Country');

    if (errors.length > 0) {
      return [`Missing required fields: ${errors.join(', ')}`];
    }

    const formatErrors = [];
    if (formData.name.trim().length < 2) formatErrors.push('Full name must be at least 2 characters');
    if (formData.password.length < 6) formatErrors.push('Password must be at least 6 characters');
    
    // STRICT PHONE VALIDATION - 10-15 digits only
    const phoneDigits = formData.phone.replace(/\D/g, ''); // Remove all non-digits
    if (phoneDigits.length < 10) {
      formatErrors.push('Phone number must contain at least 10 digits');
    } else if (phoneDigits.length > 15) {
      formatErrors.push('Phone number cannot exceed 15 digits');
    }
    
    if (formData.address.trim().length < 5) formatErrors.push('Address must be at least 5 characters');
    if (formData.city.trim().length < 2) formatErrors.push('City must be at least 2 characters');
    if (formData.state.trim().length < 2) formatErrors.push('State/Province must be at least 2 characters');
    if (formData.postalCode.trim().length < 3) formatErrors.push('Postal code must be at least 3 characters');
    if (formData.country.trim().length < 2) formatErrors.push('Country must be at least 2 characters');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      formatErrors.push('Please enter a valid email address');
    }

    // Enhanced phone format validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      formatErrors.push('Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses');
    }

    if (formData.password !== formData.confirmPassword) {
      formatErrors.push('Passwords do not match');
    }

    return formatErrors;
  };

  const isRegistrationFormComplete = () => {
    const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    return requiredFields.every(field => {
      if (field === 'phone') {
        // For phone, check if it has 10-15 digits
        const phoneDigits = formData[field].replace(/\D/g, '');
        return phoneDigits.length >= 10 && phoneDigits.length <= 15;
      }
      return formData[field] && formData[field].trim() !== '';
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        if (!formData.email.trim() || !formData.password) {
          setError('Email and password are required');
          return;
        }

        setLoading(true);

        try {
          // First try regular user login
          let response;
          try {
            response = await authService.login(formData.email, formData.password);
          } catch (userLoginError) {
            // If regular login fails, try admin login
            console.log('Regular login failed, trying admin login...');
            console.log('User login error:', userLoginError.message);
            try {
              response = await authService.adminLogin(formData.email, formData.password);
              console.log('Admin login successful');
            } catch (adminLoginError) {
              console.log('Admin login error:', adminLoginError.message);
              // If both fail, show a combined error message
              throw new Error(`Login failed. User login: ${userLoginError.message}. Admin login: ${adminLoginError.message}`);
            }
          }

          if (response.user) {
            if (response.user.role === 'admin') {
              setSuccess('Admin login successful!');
              setTimeout(() => {
                window.location.href = '/admin';
              }, 1000);
            } else {
              setSuccess('Login successful!');
              setTimeout(() => {
                onClose();
              }, 1000);
            }
            return;
          }
        } catch (loginError) {
          console.error('Login error:', loginError);
          setError(loginError.message || 'Login failed');
        }
      } else {
        if (!isRegistrationFormComplete()) {
          setError('All fields are required and phone number must be 10-15 digits.');
          return;
        }

        const validationErrors = validateRegistrationForm();
        if (validationErrors.length > 0) {
          setError(validationErrors.join(', '));
          return;
        }

        setLoading(true);

        const registrationData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim()
        };

        const response = await authService.register(registrationData);
        if (response.user) {
          setSuccess('Registration successful! Please log in.');
          setIsLogin(true);
          setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
          }));
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Common input classes for consistent styling
  const inputClasses = "w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 bg-white font-medium";
  const inputClassesWithIcon = "w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 bg-white font-medium";
  const loginInputClasses = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 bg-white font-medium";
  const loginInputClassesWithIcon = "w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 bg-white font-medium";

  // Get phone digit count for display
  const phoneDigitCount = formData.phone.replace(/\D/g, '').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Modal - Responsive and Professional */}
        <div className={`relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full ${
          isLogin ? 'max-w-md' : 'max-w-2xl'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            {!isLogin && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <strong>All fields marked with * are required. Phone number must be 10-15 digits.</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login Form */}
              {isLogin ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={loginInputClasses}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={loginInputClassesWithIcon}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Registration Form - Compact Grid Layout */
                <>
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Email address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={inputClassesWithIcon}
                          placeholder="Password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={inputClassesWithIcon}
                          placeholder="Confirm password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                        <span className={`ml-2 text-xs ${
                          phoneDigitCount >= 10 && phoneDigitCount <= 15 
                            ? 'text-green-600' 
                            : 'text-red-500'
                        }`}>
                          ({phoneDigitCount}/10-15 digits)
                        </span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`${inputClasses} ${
                            phoneDigitCount > 0 && (phoneDigitCount < 10 || phoneDigitCount > 15)
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : phoneDigitCount >= 10 && phoneDigitCount <= 15
                              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                              : ''
                          }`}
                          placeholder="Phone number (10-15 digits)"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Street address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="City"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Postal code"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Country"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || (!isLogin && !isRegistrationFormComplete())}
                  className={`w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white transition-all ${
                    loading || (!isLogin && !isRegistrationFormComplete())
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: ''
                  });
                }}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterModal;