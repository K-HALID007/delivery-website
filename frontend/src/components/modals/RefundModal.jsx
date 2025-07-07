'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Package, Truck, User, Calendar, CreditCard, Camera, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RefundModal({ isOpen, onClose, shipment, onRefundSubmit }) {
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [refundData, setRefundData] = useState({
    reason: '',
    category: '',
    description: '',
    images: [],
    expectedRefundAmount: shipment?.payment?.amount || 0,
    refundMethod: 'original',
    urgency: 'normal'
  });

  const refundCategories = [
    { id: 'damaged', label: 'Package Damaged', description: 'Item was broken or damaged during delivery' },
    { id: 'wrong_item', label: 'Wrong Item Delivered', description: 'Received different item than ordered' },
    { id: 'other', label: 'Other Issue', description: 'Any other delivery-related problem' }
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + refundData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setRefundData({
      ...refundData,
      images: [...refundData.images, ...newImages]
    });
  };

  const removeImage = (index) => {
    const newImages = refundData.images.filter((_, i) => i !== index);
    setRefundData({
      ...refundData,
      images: newImages
    });
  };

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRefundData({
        reason: '',
        category: '',
        description: '',
        images: [],
        expectedRefundAmount: shipment?.payment?.amount || 0,
        refundMethod: 'original',
        urgency: 'normal'
      });
    }
  }, [isOpen, shipment?.payment?.amount]);

  // Auto-advance to step 2 when any category is selected
  useEffect(() => {
    if (refundData.category && step === 1) {
      setStep(2);
    }
  }, [refundData.category, step]);

  const handleSubmitClick = () => {
    if (!refundData.category) {
      toast.error('Please select an issue category');
      return;
    }
    
    if (refundData.category === 'other' && !refundData.description) {
      toast.error('Please describe the issue');
      return;
    }

    if (refundData.category === 'damaged' && refundData.images.length === 0) {
      toast.error('Please upload photos of the damaged package');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('reason', refundData.reason);
      formData.append('category', refundData.category);
      formData.append('description', refundData.description);
      formData.append('expectedRefundAmount', refundData.expectedRefundAmount);
      formData.append('refundMethod', refundData.refundMethod);
      formData.append('urgency', refundData.urgency);
      
      // Add shipment details as JSON string
      formData.append('shipmentDetails', JSON.stringify({
        trackingId: shipment.trackingId,
        deliveredAt: shipment.deliveredAt,
        partnerInfo: shipment.assignedPartner,
        paymentMethod: shipment.payment.method,
        amount: shipment.payment.amount
      }));
      
      // Add images
      refundData.images.forEach((image, index) => {
        if (image.file) {
          formData.append('refundImages', image.file);
        }
      });

      await onRefundSubmit(formData);
      // Close confirmation dialog - parent component will handle modal closure
      setShowConfirmation(false);
      // Don't show success toast here as parent component handles it
    } catch (error) {
      console.error('Refund submission error:', error);
      toast.error('Failed to submit refund request');
      // Close confirmation dialog but keep main modal open so user can try again
      setShowConfirmation(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-black">Request Refund</h2>
            <p className="text-black mt-1">Tracking ID: {shipment?.trackingId}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <span className="font-medium text-black">Issue Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 max-w-20"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
              <span className="font-medium text-black">Review & Submit</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Issue Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-black">What was the issue with your delivery?</h3>
                {refundData.category && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Currently selected:</strong> {refundData.reason}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Click on a different option below to change your selection
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {refundCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setRefundData({
                          ...refundData, 
                          category: category.id, 
                          reason: category.label,
                          description: category.id === 'other' ? refundData.description : '',
                          images: category.id === 'damaged' ? refundData.images : []
                        });
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        refundData.category === category.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-black">{category.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category-specific content */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Package Damaged - Photo Upload */}
              {refundData.category === 'damaged' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-black">Upload Damage Photos</h4>
                        <p className="text-black text-sm mt-1">
                          Please provide clear photos showing the damage to help us process your refund quickly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Upload Photos of Damaged Package *
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Camera className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-black font-medium">Click to upload photos</p>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG up to 10MB each (Max 5 photos)
                        </p>
                      </label>
                    </div>

                    {/* Display uploaded images */}
                    {refundData.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-black mb-2">
                          Uploaded Photos ({refundData.images.length}/5)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {refundData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.url}
                                alt={`Damage photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                              <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Other Issue - Description Field */}
              {refundData.category === 'other' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-black">Describe Your Issue</h4>
                        <p className="text-black text-sm mt-1">
                          Please provide detailed information about the issue to help us process your refund.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Describe the issue in detail *
                    </label>
                    <textarea
                      value={refundData.description}
                      onChange={(e) => setRefundData({...refundData, description: e.target.value})}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide detailed information about the issue..."
                    />
                  </div>
                </>
              )}

              {/* Wrong Item - Simple confirmation */}
              {refundData.category === 'wrong_item' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-black">Wrong Item Delivered</h4>
                        <p className="text-black text-sm mt-1">
                          We'll process your refund for receiving the wrong item. No additional information needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Shipment Details - Common for all */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3 text-black">Shipment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-black">Tracking: {shipment?.trackingId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-black">Delivered: {new Date(shipment?.deliveredAt || shipment?.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-600" />
                    <span className="text-black">Partner: {shipment?.assignedPartner?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <span className="text-black">Paid: ₹{shipment?.payment?.amount} via {shipment?.payment?.method}</span>
                  </div>
                </div>
              </div>

              {/* What Happens Next - Common for all */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-black">What Happens Next?</h4>
                <ul className="text-black text-sm space-y-1">
                  <li>• Your request will be reviewed by our team within 24 hours</li>
                  <li>• You'll receive email updates on the progress</li>
                  <li>• Refund will be processed within 3-5 business days if approved</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => {
                  setStep(step - 1);
                  // Clear category selection when going back to step 1
                  if (step === 2) {
                    setRefundData({
                      ...refundData,
                      category: '',
                      reason: '',
                      description: '',
                      images: []
                    });
                  }
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-white transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-white transition-colors"
            >
              Cancel
            </button>
            {step === 2 && (
              <button
                onClick={handleSubmitClick}
                disabled={(refundData.category === 'damaged' && refundData.images.length === 0) ||
                         (refundData.category === 'other' && !refundData.description)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Refund Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Confirm Refund Request</h3>
              <p className="text-black text-sm mb-6">
                Are you sure you want to submit this refund request? This action cannot be undone.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-black"><strong>Category:</strong> {refundData.reason}</p>
                <p className="text-sm text-black"><strong>Tracking ID:</strong> {shipment?.trackingId}</p>
                <p className="text-sm text-black"><strong>Refund Amount:</strong> ₹{shipment?.payment?.amount}</p>
                {refundData.category === 'damaged' && (
                  <p className="text-sm text-black"><strong>Photos:</strong> {refundData.images.length} uploaded</p>
                )}
                {refundData.description && (
                  <p className="text-sm text-black"><strong>Description:</strong> {refundData.description.substring(0, 100)}{refundData.description.length > 100 ? '...' : ''}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}