'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import partnerService from '../../../services/partner.service.js';

export default function PartnerProfile() {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  // Helper function to safely handle preferredZones
  const formatPreferredZones = (zones) => {
    if (Array.isArray(zones)) {
      return zones.join(', ');
    }
    return '';
  };

  // Helper function to display preferredZones
  const displayPreferredZones = (zones) => {
    if (Array.isArray(zones) && zones.length > 0) {
      return zones.join(', ');
    }
    return 'Not specified';
  };

  useEffect(() => {
    if (!partnerService.isLoggedIn()) {
      router.push('/partner');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getProfile();
      
      if (response.success) {
        setPartner(response.partner);
        setFormData({
          name: response.partner.name || '',
          phone: response.partner.phone || '',
          address: response.partner.address?.street || '',
          city: response.partner.address?.city || '',
          state: response.partner.address?.state || '',
          postalCode: response.partner.address?.postalCode || '',
          vehicleType: response.partner.vehicleType || '',
          vehicleNumber: response.partner.vehicleNumber || '',
          licenseNumber: response.partner.licenseNumber || '',
          experience: response.partner.experience || '',
          workingHours: response.partner.workingHours || '',
          preferredZones: formatPreferredZones(response.partner.preferredZones)
        });
      }
    } catch (error) {
      setError(error.message);
      if (error.message.includes('unauthorized')) {
        partnerService.logout();
        router.push('/partner');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        ...formData,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: partner.address?.country || 'India'
        },
        preferredZones: formData.preferredZones ? formData.preferredZones.split(',').map(zone => zone.trim()) : []
      };

      const response = await partnerService.updateProfile(updateData);
      
      if (response.success) {
        setPartner(response.partner);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Update stored partner data
        localStorage.setItem('partnerData', JSON.stringify(response.partner));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data
    if (partner) {
      setFormData({
        name: partner.name || '',
        phone: partner.phone || '',
        address: partner.address?.street || '',
        city: partner.address?.city || '',
        state: partner.address?.state || '',
        postalCode: partner.address?.postalCode || '',
        vehicleType: partner.vehicleType || '',
        vehicleNumber: partner.vehicleNumber || '',
        licenseNumber: partner.licenseNumber || '',
        experience: partner.experience || '',
        workingHours: partner.workingHours || '',
        preferredZones: formatPreferredZones(partner.preferredZones)
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-6 text-lg text-slate-900 font-medium">Loading your profile...</p>
          <p className="mt-2 text-sm text-slate-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                <span className="text-teal-700">Partner</span> Profile
              </h1>
              <p className="text-slate-600 flex items-center">
                <span className="mr-2">⚙️</span>
                Manage your profile information and settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/partner/dashboard')}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm backdrop-blur-sm mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg shadow-sm backdrop-blur-sm mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-5 lg:gap-6">
          {/* Profile Summary */}
          <div className="lg:col-span-2"><div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 lg:sticky lg:top-8">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-semibold text-teal-700">
                      {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className={`w-6 h-6 rounded-full border-2 border-white ${
                      partner?.status === 'approved' ? 'bg-green-500' :
                      partner?.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{partner?.name}</h3>
                <p className="text-slate-600 mb-4 text-sm">{partner?.email}</p>
                <div className="mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    partner?.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    partner?.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {partner?.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Partner ID:</span>
                  <span className="font-medium text-slate-900">{partner?._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Rating:</span>
                  <div className="flex items-center">
                    <span className="font-medium text-slate-900 mr-2">{partner?.rating || 0}/5</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (partner?.rating || 0) ? 'text-teal-700' : 'text-slate-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Total Deliveries:</span>
                  <span className="font-medium text-slate-900">{partner?.totalDeliveries || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Completed:</span>
                  <span className="font-medium text-slate-900">{partner?.completedDeliveries || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Total Earnings:</span>
                  <span className="font-medium text-teal-700">₹{partner?.totalEarnings || 0}</span>
                </div>
              </div>

              {partner?.status === 'pending' && (
                <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Account Pending:</strong> Your account is under review. You'll receive an email once approved.
                  </p>
                </div>
              )}

              {partner?.status === 'rejected' && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Account Rejected:</strong> Please contact support for more information.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleCancel}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSave} className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.name || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Email Address
                    </label>
                    <p className="py-3 text-slate-400 bg-slate-50 px-4 rounded-lg">{partner?.email} (Cannot be changed)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.phone || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Years of experience"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.experience || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Address Information */}
                  <div className="md:col-span-2 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address Information
                    </h4>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Street Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.address?.street || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.address?.city || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter your state"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.address?.state || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Postal Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter postal code"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.address?.postalCode || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Vehicle Information */}
                  <div className="md:col-span-2 mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      Vehicle Information
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Vehicle Type
                    </label>
                    {isEditing ? (
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                        <option value="truck">Truck</option>
                      </select>
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg capitalize">{partner?.vehicleType || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Vehicle Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter vehicle number"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.vehicleNumber || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      License Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                        placeholder="Enter license number"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.licenseNumber || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Working Hours
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleChange}
                        placeholder="e.g., 9 AM - 6 PM"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">{partner?.workingHours || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Preferred Zones (comma-separated)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="preferredZones"
                        value={formData.preferredZones}
                        onChange={handleChange}
                        placeholder="e.g., Downtown, Airport, Mall Area"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all duration-200"
                      />
                    ) : (
                      <p className="py-3 text-slate-900 bg-slate-50 px-4 rounded-lg">
                        {displayPreferredZones(partner?.preferredZones)}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
