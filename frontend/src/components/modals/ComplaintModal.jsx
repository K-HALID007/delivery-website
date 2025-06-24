'use client';

import { useState } from 'react';
import { X, AlertTriangle, Package, Truck, User, Calendar, Star, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ComplaintModal({ isOpen, onClose, shipment, onComplaintSubmit }) {
  const [complaintData, setComplaintData] = useState({
    category: '',
    description: '',
    severity: 'medium',
    partnerRating: 0,
    partnerFeedback: '',
    deliveryIssues: [],
    contactAttempts: '',
    images: [],
    expectation: ''
  });

  const complaintCategories = [
    { id: 'partner_behavior', label: 'Partner Behavior Issue', description: 'Rude, unprofessional, or inappropriate behavior' },
    { id: 'delivery_time', label: 'Delivery Time Issue', description: 'Very late delivery or missed time slot' },
    { id: 'package_handling', label: 'Package Handling Issue', description: 'Rough handling or damaged package' },
    { id: 'wrong_location', label: 'Wrong Delivery Location', description: 'Delivered to wrong address or person' },
    { id: 'other', label: 'Other Issue', description: 'Any other delivery-related problem' }
  ];

  const deliveryIssueOptions = [
    'Partner was late without notification',
    'Partner was rude or unprofessional',
    'Package was handled roughly',
    'Wrong delivery address',
    'Partner did not follow delivery instructions'
  ];

  const handleIssueToggle = (issue) => {
    setComplaintData(prev => ({
      ...prev,
      deliveryIssues: prev.deliveryIssues.includes(issue)
        ? prev.deliveryIssues.filter(i => i !== issue)
        : [...prev.deliveryIssues, issue]
    }));
  };

  const handleSubmit = async () => {
    if (!complaintData.category || !complaintData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await onComplaintSubmit({
        ...complaintData,
        shipmentDetails: {
          trackingId: shipment.trackingId,
          deliveredAt: shipment.deliveredAt,
          partnerInfo: shipment.assignedPartner,
          deliveryLocation: shipment.destination,
          paymentMethod: shipment.payment.method
        }
      });
      onClose();
      toast.success('Complaint submitted successfully');
    } catch (error) {
      toast.error('Failed to submit complaint');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-black">Report Delivery Issue</h2>
            <p className="text-black mt-1">Tracking ID: {shipment?.trackingId}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Delivery Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 text-black">Delivery Summary</h3>
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
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-black">Phone: {shipment?.assignedPartner?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Issue Category */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-black">What type of issue did you experience?</h3>
            <div className="space-y-3">
              {complaintCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setComplaintData({...complaintData, category: category.id})}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    complaintData.category === category.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
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

          {/* Specific Issues */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Which specific issues occurred? (Select all that apply)</h3>
            <div className="grid grid-cols-1 gap-2">
              {deliveryIssueOptions.map((issue) => (
                <label key={issue} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded border">
                  <input
                    type="checkbox"
                    checked={complaintData.deliveryIssues.includes(issue)}
                    onChange={() => handleIssueToggle(issue)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-black">{issue}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Partner Rating */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Rate the delivery partner's service</h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setComplaintData({...complaintData, partnerRating: star})}
                  className={`p-1 ${star <= complaintData.partnerRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-black font-medium">
                {complaintData.partnerRating > 0 ? `${complaintData.partnerRating}/5 stars` : 'No rating'}
              </span>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Detailed description of the issue *
            </label>
            <textarea
              value={complaintData.description}
              onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Please provide a detailed description of what happened..."
            />
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-black mb-2">What happens after you submit this complaint?</h4>
            <ul className="text-black text-sm space-y-1">
              <li>• Your complaint will be reviewed by our admin team</li>
              <li>• The delivery partner will be notified about the issue</li>
              <li>• You'll receive updates via email within 24 hours</li>
              <li>• Appropriate action will be taken based on the severity</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!complaintData.category || !complaintData.description}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
  );
}