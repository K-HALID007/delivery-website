'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Clock, User, Star, CreditCard, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../services/api.config.js';

export default function RefundComplaintDashboard() {
  const [refunds, setRefunds] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('refunds');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      
      // Fetch refunds
      const refundResponse = await fetch('${API_URL}/admin/refunds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const refundData = await refundResponse.json();
      setRefunds(refundData.refunds || []);

      // Fetch complaints
      const complaintResponse = await fetch('${API_URL}/admin/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const complaintData = await complaintResponse.json();
      setComplaints(complaintData.complaints || []);

    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAction = async (trackingId, action, response) => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/admin/refund/${trackingId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminResponse: response })
      });

      if (res.ok) {
        toast.success(`Refund ${action}d successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const handleComplaintAction = async (trackingId, complaintId, action, response) => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/admin/complaint/${trackingId}/${complaintId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminResponse: response })
      });

      if (res.ok) {
        toast.success(`Complaint ${action}d successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to process complaint');
    }
  };

  const RefundCard = ({ refund }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-lg">Refund Request</h3>
            <p className="text-sm text-gray-600">Tracking: {refund.trackingId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          refund.payment?.refundUrgency === 'urgent' ? 'bg-red-100 text-red-800' :
          refund.payment?.refundUrgency === 'high' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {refund.payment?.refundUrgency || 'Normal'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Customer</p>
          <p className="font-medium">{refund.sender?.name}</p>
          <p className="text-gray-600">{refund.sender?.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Partner</p>
          <p className="font-medium">{refund.assignedPartner?.name || 'Not assigned'}</p>
          <p className="text-gray-600">{refund.assignedPartner?.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Amount</p>
          <p className="font-medium">₹{refund.payment?.expectedRefundAmount} / ₹{refund.payment?.amount}</p>
        </div>
        <div>
          <p className="text-gray-500">Method</p>
          <p className="font-medium">{refund.payment?.refundMethod}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Issue Category</p>
        <p className="font-medium">{refund.payment?.refundCategory}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Description</p>
        <p className="text-gray-800">{refund.payment?.refundDescription}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Delivery Details</p>
        <div className="text-sm space-y-1">
          <p>Delivered: {new Date(refund.deliveredAt || refund.createdAt).toLocaleDateString()}</p>
          <p>Location: {refund.destination}</p>
          <p>Payment: {refund.payment?.method}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleRefundAction(refund.trackingId, 'approve', 'Refund approved by admin')}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Approve Refund
        </button>
        <button
          onClick={() => handleRefundAction(refund.trackingId, 'reject', 'Refund rejected after review')}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Reject
        </button>
        <button
          onClick={() => setSelectedItem(refund)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Details
        </button>
      </div>
    </div>
  );

  const ComplaintCard = ({ complaint }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-lg">Delivery Complaint</h3>
            <p className="text-sm text-gray-600">Tracking: {complaint.trackingId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          complaint.complaints?.[0]?.severity === 'critical' ? 'bg-red-100 text-red-800' :
          complaint.complaints?.[0]?.severity === 'high' ? 'bg-orange-100 text-orange-800' :
          complaint.complaints?.[0]?.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {complaint.complaints?.[0]?.severity || 'Medium'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Customer</p>
          <p className="font-medium">{complaint.sender?.name}</p>
          <p className="text-gray-600">{complaint.sender?.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Partner</p>
          <p className="font-medium">{complaint.assignedPartner?.name || 'Not assigned'}</p>
          <p className="text-gray-600">{complaint.assignedPartner?.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Partner Rating</p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < (complaint.complaints?.[0]?.partnerRating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-1">{complaint.complaints?.[0]?.partnerRating || 0}/5</span>
          </div>
        </div>
        <div>
          <p className="text-gray-500">Submitted</p>
          <p className="font-medium">{new Date(complaint.complaints?.[0]?.submittedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Category</p>
        <p className="font-medium">{complaint.complaints?.[0]?.category}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Issues Reported</p>
        <ul className="text-sm space-y-1">
          {complaint.complaints?.[0]?.deliveryIssues?.map((issue, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>{issue}</span>
            </li>
          )) || <li>No specific issues listed</li>}
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Description</p>
        <p className="text-gray-800">{complaint.complaints?.[0]?.complaint}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">Partner Feedback</p>
        <p className="text-gray-800">{complaint.complaints?.[0]?.partnerFeedback || 'No feedback provided'}</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleComplaintAction(
            complaint.trackingId, 
            complaint.complaints?.[0]?._id, 
            'resolve', 
            'Complaint resolved after investigation'
          )}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Resolve
        </button>
        <button
          onClick={() => handleComplaintAction(
            complaint.trackingId, 
            complaint.complaints?.[0]?._id, 
            'escalate', 
            'Complaint escalated for further action'
          )}
          className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
        >
          Escalate
        </button>
        <button
          onClick={() => setSelectedItem(complaint)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Refunds & Complaints Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage customer refund requests and delivery complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{refunds.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {refunds.filter(r => r.payment?.refundUrgency === 'urgent').length + 
                 complaints.filter(c => c.complaints?.[0]?.severity === 'critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Partners Affected</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set([...refunds, ...complaints].map(item => item.assignedPartner?._id).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('refunds')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'refunds'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Refund Requests ({refunds.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'complaints'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Complaints ({complaints.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'refunds' ? (
          refunds.length > 0 ? (
            refunds.map((refund) => (
              <RefundCard key={refund._id} refund={refund} />
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No refund requests</h3>
              <p className="mt-1 text-sm text-gray-500">All refund requests have been processed.</p>
            </div>
          )
        ) : (
          complaints.length > 0 ? (
            complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints</h3>
              <p className="mt-1 text-sm text-gray-500">No delivery complaints have been submitted.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}