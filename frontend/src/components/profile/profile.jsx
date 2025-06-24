"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Building, Globe, Save, Loader2, Edit2 } from 'lucide-react';
import { authService } from '@/services/auth.service';

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

  useEffect(() => {
    loadUserData();
    
    // Listen for auth state changes
    const handleAuthStateChange = (event) => {
      const { user, isAuthenticated } = event.detail;
      if (isAuthenticated && user) {
        setUser(user);
        updateFormData(user);
      } else {
        setUser(null);
        // Redirect to home if not authenticated
        window.location.href = '/';
      }
    };

    window.addEventListener('authChange', handleAuthStateChange);

    return () => {
      window.removeEventListener('authChange', handleAuthStateChange);
    };
  }, []);

  const loadUserData = () => {
    try {
      const currentUser = authService.getCurrentUser();
      console.log('Loading user data:', currentUser);
      
      if (currentUser) {
        setUser(currentUser);
        updateFormData(currentUser);
      } else {
        setError('Please log in to view your profile');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setPageLoading(false);
    }
  };

  const updateFormData = (userData) => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: (userData.address && userData.address.street) ? userData.address.street : '',
      city: (userData.address && userData.address.city) ? userData.address.city : '',
      state: (userData.address && userData.address.state) ? userData.address.state : '',
      postalCode: (userData.address && userData.address.postalCode) ? userData.address.postalCode : '',
      country: (userData.address && userData.address.country) ? userData.address.country : '',
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
        // The auth state change will be handled by the event listener
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile');
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
    updateFormData(user); // Reset form data to current user data
    setError('');
    setSuccess('');
  };

  // State for delete modal (move to top, before any return)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteStep, setDeleteStep] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

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
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
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
      setOtpSent(true);
      setDeleteStep('otp');
      setDeleteSuccess('OTP sent to your email.');
    } catch (err) {
      setDeleteError(err.message || 'Failed to send OTP');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg">

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteOtp('');
                  setDeleteStep('password');
                  setOtpSent(false);
                  setDeleteError('');
                  setDeleteSuccess('');
                }}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Account</h2>
              {deleteError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{deleteError}</div>
              )}
              {deleteSuccess && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-green-600 text-sm">{deleteSuccess}</div>
              )}
              {deleteStep === 'password' && (
                <>
                  <p className="mb-2 text-gray-700">To confirm, enter your password:</p>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                    placeholder="Password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    disabled={deleteLoading}
                  />
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 mb-2 disabled:opacity-60"
                    disabled={deleteLoading || !deletePassword}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                  <button
                    onClick={handleSendOtp}
                    className="w-full bg-amber-500 text-white py-2 rounded hover:bg-amber-600 disabled:opacity-60"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Sending OTP...' : 'Forgot password? Use Email OTP'}
                  </button>
                </>
              )}
              {deleteStep === 'otp' && (
                <>
                  <p className="mb-2 text-gray-700">Enter the OTP sent to your email:</p>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-black"
                    placeholder="OTP"
                    value={deleteOtp}
                    onChange={e => setDeleteOtp(e.target.value)}
                    disabled={deleteLoading}
                  />
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 mb-2 disabled:opacity-60"
                    disabled={deleteLoading || !deleteOtp}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                  <button
                    onClick={() => setDeleteStep('password')}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 disabled:opacity-60"
                    disabled={deleteLoading}
                  >
                    Back to password method
                  </button>
                </>
              )}
            </div>
          </div>
        )}
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-lg px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-amber-500" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-amber-100">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                              : 'border-transparent bg-gray-50 text-gray-900'
                          } rounded-lg transition-all`}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                              : 'border-transparent bg-gray-50 text-gray-900'
                          } rounded-lg transition-all`}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                              : 'border-transparent bg-gray-50 text-gray-900'
                          } rounded-lg transition-all`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                              : 'border-transparent bg-gray-50 text-gray-900'
                          } rounded-lg transition-all`}
                          placeholder="Enter your street address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`block w-full pl-10 pr-3 py-3 border ${
                              isEditing 
                                ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                                : 'border-transparent bg-gray-50 text-gray-900'
                            } rounded-lg transition-all`}
                            placeholder="Enter your city"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`block w-full pl-10 pr-3 py-3 border ${
                              isEditing 
                                ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                                : 'border-transparent bg-gray-50 text-gray-900'
                            } rounded-lg transition-all`}
                            placeholder="Enter your state"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`block w-full pl-10 pr-3 py-3 border ${
                              isEditing 
                                ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                                : 'border-transparent bg-gray-50 text-gray-900'
                            } rounded-lg transition-all`}
                            placeholder="Enter your postal code"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`block w-full pl-10 pr-3 py-3 border ${
                              isEditing 
                                ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900' 
                                : 'border-transparent bg-gray-50 text-gray-900'
                            } rounded-lg transition-all`}
                            placeholder="Enter your country"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional spacing for alignment */}
                    <div className="pt-[72px]">
                      {/* This div creates spacing to align with the 4 fields on the left */}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                {isEditing && (
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;