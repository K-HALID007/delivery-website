"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Save, 
  Loader2, 
  Edit2, 
  ShieldCheck, 
  AlertTriangle,
  Lock,
  KeyRound
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  // State for delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteStep, setDeleteStep] = useState('password'); // 'password' or 'otp'
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    loadUserData();
    
    const handleAuthStateChange = (event) => {
      const { user: authUser, isAuthenticated } = event.detail;
      if (isAuthenticated && authUser) {
        setUser(authUser);
        updateFormData(authUser);
      } else {
        setUser(null);
        window.location.href = '/';
      }
    };

    window.addEventListener('authChange', handleAuthStateChange);
    return () => window.removeEventListener('authChange', handleAuthStateChange);
  }, []);

  const loadUserData = () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        updateFormData(currentUser);
      } else {
        setError('Please log in to view your profile');
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setPageLoading(false);
    }
  };

  const updateFormData = (userData) => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address?.street || userData.address || '',
      city: userData.address?.city || userData.city || '',
      state: userData.address?.state || userData.state || '',
      postalCode: userData.address?.postalCode || userData.postalCode || '',
      country: userData.address?.country || userData.country || 'India'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.updateProfile(formData);
      if (response.success) {
        setSuccess('Profile updated successfully');
        setUser(response.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (user) updateFormData(user);
    setError('');
    setSuccess('');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    setDeleteLoading(true);
    try {
      if (deleteStep === 'password') {
        await authService.deleteAccount({ password: deletePassword });
      } else {
        await authService.deleteAccount({ otp: deleteOtp });
      }
      setDeleteSuccess('Account deleted. Redirecting...');
      toast.info('Account deleted');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    setDeleteLoading(true);
    try {
      await authService.requestDeleteAccountOtp();
      setDeleteStep('otp');
      setDeleteSuccess('Verification code sent to your registered email.');
      toast.info('Verification code sent to email');
    } catch (err) {
      setDeleteError(err.message || 'Failed to send OTP code');
      toast.error(err.message || 'Failed to send OTP code');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const inputClass = (editable) => 
    `block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl transition ${
      editable 
        ? 'border border-slate-300 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-white text-slate-900' 
        : 'border border-slate-200 bg-slate-50 text-slate-700 cursor-not-allowed'
    }`;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pt-28 pb-20 antialiased">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Profile Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-slate-900 px-6 sm:px-8 py-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 text-xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'Customer'}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-[11px] font-semibold text-teal-300 border border-teal-500/30">
                      Verified Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/80 rounded-xl text-xs font-semibold transition"
                >
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Personal & Delivery Dispatch Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This information auto-populates as sender defaults when booking consignments.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Personal Contact */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputClass(isEditing)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputClass(isEditing)}
                        placeholder="Your email address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputClass(isEditing)}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Address */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Default Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputClass(isEditing)}
                        placeholder="Building, street address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={inputClass(isEditing)}
                          placeholder="City"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        State
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={inputClass(isEditing)}
                          placeholder="State"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputClass(isEditing)}
                        placeholder="PIN code"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputClass(isEditing)}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Submit Changes */}
              {isEditing && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 w-full max-w-md relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword('');
                setDeleteOtp('');
                setDeleteStep('password');
                setDeleteError('');
                setDeleteSuccess('');
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Account Permanently</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {deleteError}
              </div>
            )}
            {deleteSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs">
                {deleteSuccess}
              </div>
            )}

            {deleteStep === 'password' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  To confirm account deletion, please enter your account password:
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="Enter your account password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={deleteLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  disabled={deleteLoading || !deletePassword}
                >
                  {deleteLoading ? 'Processing...' : 'Confirm Account Deletion'}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Transmitting code...' : 'Forgot password? Verify with Email OTP'}
                </button>
              </div>
            )}

            {deleteStep === 'otp' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter the 6-digit verification code transmitted to your email address:
                </p>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-center focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="Enter code"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    disabled={deleteLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  disabled={deleteLoading || !deleteOtp}
                >
                  {deleteLoading ? 'Verifying...' : 'Verify & Delete Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteStep('password')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                  disabled={deleteLoading}
                >
                  Back to password verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;