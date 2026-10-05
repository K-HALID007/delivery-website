"use client";

import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, Building, Globe, Loader2, Eye, EyeOff, AlertCircle, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import partnerService from '@/services/partner.service';
import { toast } from 'react-toastify';

const LoginRegisterModal = ({ isOpen, onClose, onLoginSuccess, initialData = {}, initialMode = 'login' }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [accountType, setAccountType] = useState('user'); // 'user' or 'partner'
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    password: '',
    confirmPassword: '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync initialData and initialMode if provided when opening
  React.useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setIsLogin(initialMode === 'login');
      }
      if (initialData && Object.keys(initialData).length > 0) {
        setFormData(prev => ({
          ...prev,
          name: initialData.name || prev.name,
          email: initialData.email || prev.email,
          phone: initialData.phone || prev.phone,
          address: initialData.address || prev.address,
          city: initialData.city || prev.city,
          state: initialData.state || prev.state,
          postalCode: initialData.postalCode || prev.postalCode,
          country: initialData.country || prev.country
        }));
      }
    }
  }, [isOpen, initialMode]);

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

  // Check if email is admin email
  const isAdminEmail = (email) => {
    const adminEmails = [
      'admin@courier.com',
      'admin@gmail.com',
      'admin@primedispatcher.com',
      'admin@example.com',
      'admin@admin.com'
    ];
    return adminEmails.includes(email.toLowerCase().trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        if (!formData.email.trim() || !formData.password) {
          const msg = 'Email and password are required';
          setError(msg);
          toast.error(msg);
          return;
        }

        setLoading(true);

        // Partner login mode
        if (accountType === 'partner') {
          try {
            const res = await partnerService.login({
              email: formData.email.trim(),
              password: formData.password
            });
            if (res.success) {
              const successMsg = `Welcome ${res.partner?.name || 'Partner'}! Redirecting to Fleet Dashboard...`;
              setSuccess(successMsg);
              toast.success(successMsg);
              setTimeout(() => {
                onClose();
                window.location.href = '/partner/dashboard';
              }, 700);
              return;
            }
          } catch (partnerErr) {
            console.error('Partner login error:', partnerErr);
            const errText = partnerErr.message || 'Partner login failed. Make sure your account is approved by admin.';
            setError(errText);
            toast.error(errText);
            return;
          } finally {
            setLoading(false);
          }
          return;
        }

        // Check if it's an admin email
        const isAdmin = isAdminEmail(formData.email);
        
        try {
          let response;
          
          if (isAdmin) {
            // Try admin login first for admin emails
            console.log('Admin email detected, trying admin login...');
            try {
              response = await authService.adminLogin(formData.email, formData.password);
              console.log('Admin login successful');
            } catch (adminLoginError) {
              console.log('Admin login failed, trying regular login...');
              response = await authService.login(formData.email, formData.password);
            }
          } else {
            // Try regular login first for non-admin emails
            try {
              response = await authService.login(formData.email, formData.password);
            } catch (userLoginError) {
              // If regular login fails, try admin login as fallback
              console.log('Regular login failed, trying admin login...');
              response = await authService.adminLogin(formData.email, formData.password);
            }
          }

          if (response.user) {
            if (response.user.role === 'admin') {
              setSuccess('Admin login successful! Redirecting to dashboard...');
              toast.success('Admin login verified! Welcome to Control Console');
              setTimeout(() => {
                onClose();
                window.location.href = '/admin';
              }, 800);
            } else if (onLoginSuccess) {
              setSuccess('Login successful! Proceeding...');
              toast.success(`Welcome back, ${response.user.name || 'User'}!`);
              setTimeout(() => {
                onClose();
                onLoginSuccess(response.user);
              }, 400);
            } else {
              setSuccess('Login successful! Welcome back!');
              toast.success(`Welcome back, ${response.user.name || 'User'}!`);
              setTimeout(() => {
                onClose();
                window.location.reload();
              }, 800);
            }
            return;
          }
        } catch (loginError) {
          console.error('Login error:', loginError);
          const errText = loginError.message || 'Invalid email or password';
          setError(errText);
          toast.error(errText);
        }
      } else {
        // Registration logic
        if (!isRegistrationFormComplete()) {
          const msg = 'All fields are required and phone number must be 10-15 digits.';
          setError(msg);
          toast.error(msg);
          return;
        }

        const validationErrors = validateRegistrationForm();
        if (validationErrors.length > 0) {
          const msg = validationErrors.join(', ');
          setError(msg);
          toast.error(msg);
          return;
        }

        setLoading(true);

        // Check if registering with admin email
        const isAdmin = isAdminEmail(formData.email);
        
        const registrationData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
          role: isAdmin ? 'admin' : 'user' // Set role based on email
        };

        const response = await authService.register(registrationData);
        if (response.user) {
          if (response.user.role === 'admin') {
            setSuccess('Admin account created successfully! Redirecting to dashboard...');
            toast.success('Admin account created! Redirecting...');
            setTimeout(() => {
              onClose();
              window.location.href = '/admin';
            }, 1000);
          } else if (onLoginSuccess) {
            setSuccess('Registration successful! Proceeding...');
            toast.success('Account created successfully! Welcome!');
            setTimeout(() => {
              onClose();
              onLoginSuccess(response.user);
            }, 400);
          } else {
            setSuccess('Registration successful! Welcome to Prime Dispatcher!');
            toast.success('Account created successfully! Welcome!');
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 800);
          }
        }
      }
    } catch (error) {
      const errText = error.message || 'An error occurred';
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Common input classes for consistent styling
  const inputClasses = "w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all text-slate-900 placeholder-slate-400 bg-white text-sm";
  const inputClassesWithIcon = "w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all text-slate-900 placeholder-slate-400 bg-white text-sm";
  const loginInputClasses = "w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all text-slate-900 placeholder-slate-400 bg-white text-sm";
  const loginInputClassesWithIcon = "w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all text-slate-900 placeholder-slate-400 bg-white text-sm";

  // Get phone digit count for display
  const phoneDigitCount = formData.phone.replace(/\D/g, '').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-[100dvh] items-start sm:items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Modal - Responsive and Professional */}
        <div className={`relative my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto transform rounded-2xl bg-white shadow-2xl transition-all w-full border border-slate-200 ${
          isLogin ? 'max-w-md' : 'max-w-2xl'
        }`}>
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {isLogin ? 'Sign In to Prime Dispatcher' : 'Create an Account'}
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
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
                  {/* Account Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Sign In As
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-4">
                      <button
                        type="button"
                        onClick={() => { setAccountType('user'); setError(''); }}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          accountType === 'user'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        Customer / Public
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAccountType('partner'); setError(''); }}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          accountType === 'partner'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5 text-teal-600" />
                        Delivery Partner
                      </button>
                    </div>
                  </div>

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
                  className={`w-full flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
                    loading || (!isLogin && !isRegistrationFormComplete())
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin 
                        ? (accountType === 'partner' ? 'Verifying partner credentials...' : 'Signing in...') 
                        : 'Creating account...'}
                    </>
                  ) : (
                    isLogin 
                      ? (accountType === 'partner' ? 'Sign In to Partner Fleet →' : 'Sign In') 
                      : 'Create Account'
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
                  setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                  }));
                }}
                className="text-teal-700 hover:text-teal-800 font-semibold text-sm transition-colors"
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
