'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, User, Phone, Mail, Package, Calendar, Filter, Search, Download, Eye, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sample complaints data (replace with actual API call)
  const sampleComplaints = [
    {
      id: 'CMP-1703123456',
      category: 'delivery_delay',
      categoryName: 'Delivery Delay',
      userInfo: {
        name: 'Ahmed Ali',
        phone: '+92-300-1234567',
        email: 'ahmed@example.com',
        trackingId: 'TRK-001'
      },
      description: 'Mera package 3 din se pending hai, delivery nahi hui',
      status: 'pending',
      priority: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messages: ['Mera package track karna hai', 'Delivery mein deri ho rahi hai'],
      adminNotes: '',
      assignedTo: '',
      estimatedResolution: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      id: 'CMP-1703123457',
      category: 'damaged_package',
      categoryName: 'Damaged Package',
      userInfo: {
        name: 'Fatima Khan',
        phone: '+92-301-9876543',
        email: 'fatima@example.com',
        trackingId: 'TRK-002'
      },
      description: 'Package damaged condition mein mila',
      status: 'in_progress',
      priority: 'high',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      messages: ['Package kharab hai', 'Replacement chahiye'],
      adminNotes: 'Investigating with delivery partner',
      assignedTo: 'Support Team A',
      estimatedResolution: new Date(Date.now() + 12 * 60 * 60 * 1000)
    },
    {
      id: 'CMP-1703123458',
      category: 'poor_service',
      categoryName: 'Poor Service',
      userInfo: {
        name: 'Muhammad Hassan',
        phone: '+92-302-5555555',
        email: '',
        trackingId: ''
      },
      description: 'Delivery boy ka behavior theek nahi tha',
      status: 'resolved',
      priority: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messages: ['Service complaint hai', 'Delivery boy rude tha'],
      adminNotes: 'Spoke with delivery partner, issue resolved',
      assignedTo: 'Support Team B',
      estimatedResolution: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setComplaints(sampleComplaints);
      setFilteredComplaints(sampleComplaints);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, filterStatus, filterPriority, searchTerm]);

  const filterComplaints = () => {
    let filtered = complaints;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === filterPriority);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint => 
        complaint.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userInfo.phone.includes(searchTerm)
      );
    }

    setFilteredComplaints(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const updateComplaintStatus = (complaintId, newStatus) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus }
        : complaint
    ));
    toast.success(`Complaint status updated to ${newStatus}`);
  };

  const addAdminNote = (complaintId, note) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, adminNotes: note }
        : complaint
    ));
    toast.success('Admin note added');
  };

  const assignComplaint = (complaintId, assignee) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, assignedTo: assignee }
        : complaint
    ));
    toast.success(`Complaint assigned to ${assignee}`);
  };

  const exportComplaints = () => {
    const csvContent = [
      ['ID', 'Customer', 'Phone', 'Category', 'Status', 'Priority', 'Date', 'Assigned To'].join(','),
      ...filteredComplaints.map(complaint => [
        complaint.id,
        complaint.userInfo.name,
        complaint.userInfo.phone,
        complaint.categoryName,
        complaint.status,
        complaint.priority,
        complaint.timestamp.toLocaleDateString(),
        complaint.assignedTo || 'Unassigned'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Complaints exported successfully');
  };

  const getComplaintStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const highPriority = complaints.filter(c => c.priority === 'high').length;

    return { total, pending, inProgress, resolved, highPriority };
  };

  const stats = getComplaintStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Complaint Management Dashboard</h1>
        <p className="text-slate-600">User complaints aur unka management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Complaints</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={exportComplaints}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700">Complaint ID</th>
                <th className="text-left p-4 font-semibold text-slate-700">Customer</th>
                <th className="text-left p-4 font-semibold text-slate-700">Category</th>
                <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 font-semibold text-slate-700">Priority</th>
                <th className="text-left p-4 font-semibold text-slate-700">Date</th>
                <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="border-b hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-mono text-sm text-blue-600">{complaint.id}</div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-slate-800">{complaint.userInfo.name}</div>
                      <div className="text-sm text-slate-600">{complaint.userInfo.phone}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{complaint.categoryName}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      <span className="capitalize">{complaint.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(complaint.priority)}`}></div>
                      <span className="text-sm capitalize">{complaint.priority}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-600">
                      {complaint.timestamp.toLocaleDateString()}
                      <br />
                      <span className="text-xs">{complaint.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No complaints found</p>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Complaint ID</label>
                    <p className="font-mono text-blue-600">{selectedComplaint.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <p>{selectedComplaint.categoryName}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Name</label>
                      <p>{selectedComplaint.userInfo.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Phone</label>
                      <p>{selectedComplaint.userInfo.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Email</label>
                      <p>{selectedComplaint.userInfo.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Tracking ID</label>
                      <p>{selectedComplaint.userInfo.trackingId || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Customer Messages</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    {selectedComplaint.messages.map((message, index) => (
                      <p key={index} className="text-sm">• {message}</p>
                    ))}
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Status Management</h3>
                  <div className="flex space-x-2 mb-4">
                    {['pending', 'in_progress', 'resolved', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateComplaintStatus(selectedComplaint.id, status)}
                        className={`px-3 py-1 rounded text-sm ${
                          selectedComplaint.status === status
                            ? 'bg-yellow-500 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignment */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">Assign To</label>
                  <select
                    value={selectedComplaint.assignedTo}
                    onChange={(e) => assignComplaint(selectedComplaint.id, e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select Team Member</option>
                    <option value="Support Team A">Support Team A</option>
                    <option value="Support Team B">Support Team B</option>
                    <option value="Senior Support">Senior Support</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">Admin Notes</label>
                  <textarea
                    value={selectedComplaint.adminNotes}
                    onChange={(e) => addAdminNote(selectedComplaint.id, e.target.value)}
                    placeholder="Add internal notes..."
                    className="w-full mt-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}