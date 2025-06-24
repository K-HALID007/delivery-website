"use client";
import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Package,
  Users,
  Clock,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  X,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image,
  MapPin,
  Phone,
  Mail,
  Truck,
  CreditCard,
  FileImage,
  ZoomIn,
  ExternalLink,
  DownloadCloud,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState('performance');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  const reportTypes = [
    { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'Overall business performance metrics' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Revenue, costs, and profit analysis' },
    { id: 'operational', name: 'Operational Report', icon: Package, description: 'Delivery times, success rates, efficiency' },
    { id: 'customer', name: 'Customer Report', icon: Users, description: 'User activity and satisfaction metrics' },
    { id: 'audit', name: 'Audit Report', icon: FileText, description: 'System logs and compliance data' }
  ];

  const dateRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    generateReport();
  }, [selectedReport, dateRange]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(
        `http://localhost:5000/api/admin/reports?reportType=${selectedReport}&dateRange=${dateRange}`, 
        { headers }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setReportData(data);
        console.log('Generated real-time report:', data);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback to empty data on error
      setReportData({
        summary: {},
        chartData: null,
        recentEvents: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    // Simulate export functionality
    const fileName = `${selectedReport}_report_${dateRange}.${format}`;
    console.log(`Exporting ${fileName}`);
    // In real implementation, this would generate and download the file
    alert(`Report exported as ${fileName}`);
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const closeCustomerModal = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(false);
  };

  const viewImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  const downloadImage = async (image) => {
    try {
      // Fix the image URL to use correct backend URL
      const imageUrl = image.imageUrl.startsWith('http') 
        ? image.imageUrl 
        : `http://localhost:5000${image.imageUrl}`;
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.originalName || image.filename || 'evidence.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const openApprovalModal = (refund) => {
    setSelectedRefund(refund);
    setAdminResponse('');
    setShowApprovalModal(true);
  };

  // Auto-generate response based on action and refund details
  const useAutoResponse = (action) => {
    const autoResponse = generateAutoResponse(action, selectedRefund);
    setAdminResponse(autoResponse);
  };

  // Generate automatic admin response based on refund category and reason
  const generateAutoResponse = (action, refund) => {
    const category = refund.refundCategory?.toLowerCase() || '';
    const reason = refund.refundReason?.toLowerCase() || '';
    
    if (action === 'approve') {
      // Approval responses based on category
      if (category.includes('damage') || reason.includes('damage')) {
        return `Refund approved. We sincerely apologize for the damaged package. Our quality control team has been notified to prevent such incidents. Full refund of ₹${refund.refundAmount} will be processed within 3-5 business days.`;
      } else if (category.includes('delay') || reason.includes('delay') || reason.includes('late')) {
        return `Refund approved. We apologize for the delivery delay. We understand the inconvenience caused and are working to improve our delivery timelines. Refund of ₹${refund.refundAmount} will be processed within 3-5 business days.`;
      } else if (category.includes('lost') || reason.includes('lost') || reason.includes('missing')) {
        return `Refund approved. We deeply regret that your package was lost during transit. Our logistics team is investigating this matter. Full refund of ₹${refund.refundAmount} will be processed immediately within 24-48 hours.`;
      } else if (category.includes('wrong') || reason.includes('wrong') || reason.includes('incorrect')) {
        return `Refund approved. We apologize for delivering to the wrong address. This was an error on our part and we take full responsibility. Refund of ₹${refund.refundAmount} will be processed within 2-3 business days.`;
      } else if (category.includes('quality') || reason.includes('quality') || reason.includes('defective')) {
        return `Refund approved. We're sorry the package quality didn't meet your expectations. Your feedback helps us improve our service standards. Refund of ₹${refund.refundAmount} will be processed within 3-5 business days.`;
      } else if (category.includes('service') || reason.includes('service') || reason.includes('behavior')) {
        return `Refund approved. We sincerely apologize for the poor service experience. We are taking immediate action to address this with our delivery partner. Refund of ₹${refund.refundAmount} will be processed within 2-3 business days.`;
      } else {
        return `Refund approved after careful review of your request. We apologize for any inconvenience caused. Refund of ₹${refund.refundAmount} will be processed within 3-5 business days. Thank you for your patience.`;
      }
    } else {
      // Rejection responses based on category
      if (category.includes('damage') || reason.includes('damage')) {
        return `Refund request declined. After reviewing the evidence provided, the damage appears to be due to mishandling after delivery. Our delivery partner confirmed successful delivery in good condition. Please contact the sender for resolution.`;
      } else if (category.includes('delay') || reason.includes('delay')) {
        return `Refund request declined. The delivery was completed within the estimated timeframe. Minor delays can occur due to weather or traffic conditions, which are beyond our control. The package was delivered successfully.`;
      } else if (category.includes('lost') || reason.includes('lost')) {
        return `Refund request declined. Our tracking records show the package was successfully delivered to the specified address. Please check with neighbors or building management. If you still cannot locate the package, please file a police report.`;
      } else if (category.includes('wrong') || reason.includes('wrong')) {
        return `Refund request declined. Our delivery records confirm delivery to the correct address as provided. Please verify the address details and check with the recipient. The delivery was completed as per instructions.`;
      } else if (category.includes('quality') || reason.includes('quality')) {
        return `Refund request declined. The package was delivered in the same condition as received from the sender. Quality issues should be addressed directly with the sender/merchant. Our responsibility is limited to safe transportation.`;
      } else if (category.includes('service') || reason.includes('service')) {
        return `Refund request declined. While we regret any service concerns, the delivery was completed successfully. We have noted your feedback for partner improvement. Service issues alone do not qualify for refunds unless delivery failed.`;
      } else {
        return `Refund request declined after thorough review. The delivery was completed as per our terms and conditions. If you have additional evidence or concerns, please contact our customer support team for further assistance.`;
      }
    }
  };

  const closeApprovalModal = () => {
    setSelectedRefund(null);
    setShowApprovalModal(false);
    setAdminResponse('');
  };

  const handleRefundApproval = async (action) => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:5000/api/admin/refund/${selectedRefund.trackingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: action, // 'approve' or 'reject'
          adminResponse: adminResponse,
          adminNotes: adminResponse
        })
      });

      if (response.ok) {
        alert(`Refund ${action}d successfully!`);
        closeApprovalModal();
        // Refresh the report data
        generateReport();
      } else {
        throw new Error(`Failed to ${action} refund`);
      }
    } catch (error) {
      console.error(`Error ${action}ing refund:`, error);
      alert(`Failed to ${action} refund. Please try again.`);
    }
  };

  // Create a placeholder image for failed loads
  const createPlaceholderImage = (width = 48, height = 48) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#F3F4F6" rx="4"/>
        <path d="M${width/2} ${height*0.75}C${width*0.65} ${height*0.75} ${width*0.75} ${width*0.65} ${width*0.75} ${height/2}C${width*0.75} ${height*0.35} ${width*0.65} ${width*0.25} ${width/2} ${width*0.25}C${width*0.35} ${width*0.25} ${width*0.25} ${height*0.35} ${width*0.25} ${height/2}C${width*0.25} ${width*0.65} ${width*0.35} ${height*0.75} ${width/2} ${height*0.75}Z" stroke="#9CA3AF" stroke-width="2"/>
        <path d="M${width/2} ${height*0.6}V${height*0.4}" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
        <circle cx="${width/2}" cy="${height*0.7}" r="1" fill="#9CA3AF"/>
        <text x="${width/2}" y="${height*0.9}" text-anchor="middle" fill="#9CA3AF" font-family="Arial" font-size="8">No Image</text>
      </svg>
    `)}`;
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-gray-600">Generating report...</p>
          </div>
        </div>
      );
    }

    if (!reportData) return null;

    const currentReport = reportTypes.find(r => r.id === selectedReport);

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <currentReport.icon className="w-6 h-6 text-amber-500 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-black">{currentReport.name}</h3>
                <p className="text-gray-600">{currentReport.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => exportReport('xlsx')}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Only for Customer Report */}
        {selectedReport === 'customer' && reportData.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{reportData.summary.customersWithRefunds}</div>
                <div className="text-sm text-gray-600 mt-1">Customers with Refunds</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{reportData.summary.totalRefundRequests}</div>
                <div className="text-sm text-gray-600 mt-1">Total Refund Requests</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">₹{reportData.summary.totalRefundAmount}</div>
                <div className="text-sm text-gray-600 mt-1">Total Refund Amount</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{reportData.summary.avgRefundRate}%</div>
                <div className="text-sm text-gray-600 mt-1">Average Refund Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards for Other Reports */}
        {selectedReport !== 'customer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(reportData.summary).map(([key, value], index) => (
              <div key={key} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                    {key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Uptime') ? '%' : ''}
                    {key.includes('Revenue') || key.includes('Costs') || key.includes('Profit') || key.includes('Value') ? '' : ''}
                    {key.includes('Time') ? ' days' : ''}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart Visualization - Only for Non-Customer Reports */}
        {selectedReport !== 'customer' && reportData.chartData && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-amber-500" />
              Data Visualization
            </h4>
            <div className="h-80">
              {selectedReport === 'performance' && (
                <Bar 
                  data={reportData.chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#000' } } },
                    scales: {
                      x: { ticks: { color: '#000' } },
                      y: { ticks: { color: '#000' } }
                    }
                  }} 
                />
              )}
              {(selectedReport === 'financial' || selectedReport === 'operational') && (
                <Doughnut 
                  data={reportData.chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        labels: { color: '#000' },
                        position: 'bottom'
                      } 
                    }
                  }} 
                />
              )}
            </div>
          </div>
        )}

        {/* Customer Report Table */}
        {selectedReport === 'customer' && reportData.tableData && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-amber-500" />
              Customer Refund Details
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Refunds</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.tableData.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.customerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {customer.totalRefunds}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {customer.approvedRefunds}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {customer.rejectedRefunds}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {customer.pendingRefunds}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-semibold">₹{customer.totalAmount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'All Approved' ? 'bg-green-100 text-green-800' :
                          customer.status === 'Has Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-semibold">{customer.approvalRate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Events Table */}
        {selectedReport === 'audit' && reportData.recentEvents && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-black mb-4">Recent System Events</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.recentEvents.map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.event}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive business reports and insights</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedReport === report.id
                  ? 'border-amber-500 bg-amber-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${
                selectedReport === report.id ? 'text-amber-600' : 'text-gray-600'
              }`} />
              <h3 className={`font-semibold text-sm ${
                selectedReport === report.id ? 'text-amber-800' : 'text-gray-800'
              }`}>
                {report.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {renderReportContent()}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-black">Customer Details</h3>
                  <p className="text-gray-600">{selectedCustomer.customerId} - {selectedCustomer.name}</p>
                </div>
              </div>
              <button
                onClick={closeCustomerModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-black mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-amber-500" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900 font-medium">{selectedCustomer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-black mb-3">Refund Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalRefunds}</div>
                    <div className="text-sm text-gray-600">Total Refunds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedCustomer.approvedRefunds}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedCustomer.rejectedRefunds}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{selectedCustomer.pendingRefunds}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedCustomer.approvalRate}</div>
                    <div className="text-sm text-gray-600">Approval Rate</div>
                  </div>
                </div>
              </div>

              {/* Refund Details Table */}
              {selectedCustomer.refundDetails && selectedCustomer.refundDetails.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-black mb-3">All Refund Requests</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Info</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route & Package</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner Details</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Info</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund Details</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Timeline</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Actions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence & Photos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedCustomer.refundDetails.map((refund, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {/* Tracking ID */}
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-2 text-amber-500" />
                                <div>
                                  <div className="font-bold text-blue-600">{refund.trackingId}</div>
                                  <div className="text-xs text-gray-500">Track ID</div>
                                </div>
                              </div>
                            </td>

                            {/* Order Info */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                  <span className="text-xs">Order: {refund.orderDate}</span>
                                </div>
                                {refund.deliveryDate && refund.deliveryDate !== 'Not Delivered' && (
                                  <div className="flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                    <span className="text-xs">Delivered: {refund.deliveryDate}</span>
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  Requested: {new Date(refund.requestedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </td>

                            {/* Route & Package */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 text-green-500" />
                                  <span className="text-xs font-medium">{refund.origin}</span>
                                </div>
                                <div className="text-gray-400 text-center">↓</div>
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 text-red-500" />
                                  <span className="text-xs font-medium">{refund.destination}</span>
                                </div>
                                <div className="border-t pt-1 mt-2">
                                  <div className="text-xs text-gray-600">{refund.packageType}</div>
                                  <div className="text-xs text-gray-500">{refund.packageWeight}</div>
                                </div>
                              </div>
                            </td>

                            {/* Partner Details */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Truck className="w-3 h-3 mr-1 text-blue-500" />
                                  <span className="text-xs font-medium">{refund.partnerName}</span>
                                </div>
                                <div className="text-xs text-gray-500">{refund.vehicleInfo}</div>
                                {refund.partnerPhone && refund.partnerPhone !== 'N/A' && (
                                  <div className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                    <span className="text-xs">{refund.partnerPhone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Payment Info */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <CreditCard className="w-3 h-3 mr-1 text-green-500" />
                                  <span className="text-xs">Original: {refund.originalAmount}</span>
                                </div>
                                <div className="flex items-center">
                                  <CreditCard className="w-3 h-3 mr-1 text-red-500" />
                                  <span className="text-xs font-semibold">Refund: {refund.refundAmount}</span>
                                </div>
                                <div className="text-xs text-gray-500">{refund.paymentMethod}</div>
                                {refund.transactionId && (
                                  <div className="text-xs text-gray-400">TXN: {refund.transactionId}</div>
                                )}
                              </div>
                            </td>

                            {/* Refund Details */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-1">
                                <div className="font-medium text-red-600">{refund.refundCategory}</div>
                                <div className="text-xs text-gray-600">{refund.refundReason}</div>
                                {refund.refundDescription && (
                                  <div className="text-xs text-gray-500 bg-gray-50 p-1 rounded">
                                    {refund.refundDescription}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status & Timeline */}
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  refund.refundStatusDisplay === 'Approved & Processed' ? 'bg-green-100 text-green-800' :
                                  refund.refundStatusDisplay === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {refund.refundStatusDisplay}
                                </span>
                                {refund.processingTime && (
                                  <div className="text-xs text-gray-500">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {refund.processingTime}
                                  </div>
                                )}
                                {refund.approvedAt && (
                                  <div className="text-xs text-green-600">
                                    ✓ Approved: {new Date(refund.approvedAt).toLocaleDateString()}
                                  </div>
                                )}
                                {refund.rejectedAt && (
                                  <div className="text-xs text-red-600">
                                    ✗ Rejected: {new Date(refund.rejectedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Admin Actions */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-2">
                                {refund.adminResponse && refund.adminResponse !== 'No response yet' ? (
                                  <div className="bg-blue-50 p-2 rounded text-xs">
                                    <div className="font-medium text-blue-800">Admin Response:</div>
                                    <div className="text-blue-700">{refund.adminResponse}</div>
                                  </div>
                                ) : (
                                  <div className="text-gray-500 italic text-xs">No response yet</div>
                                )}
                                {refund.adminNotes && refund.adminNotes !== 'No notes' && (
                                  <div className="bg-gray-50 p-2 rounded text-xs">
                                    <div className="font-medium text-gray-700">Notes:</div>
                                    <div className="text-gray-600">{refund.adminNotes}</div>
                                  </div>
                                )}
                                
                                {/* Admin Action Buttons */}
                                {refund.refundStatusDisplay === 'Under Review' && (
                                  <div className="flex flex-col space-y-1">
                                    <button
                                      onClick={() => openApprovalModal(refund)}
                                      className="flex items-center justify-center px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                    >
                                      <ThumbsUp className="w-3 h-3 mr-1" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openApprovalModal(refund)}
                                      className="flex items-center justify-center px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                    >
                                      <ThumbsDown className="w-3 h-3 mr-1" />
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Evidence & Photos */}
                            <td className="px-4 py-4 text-sm text-gray-900">
                              <div className="space-y-2">
                                {refund.hasImages ? (
                                  <div>
                                    <div className="flex items-center text-green-600 mb-2">
                                      <FileImage className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">{refund.imageCount} files</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                      {refund.images && refund.images.slice(0, 4).map((image, imgIndex) => {
                                        // Fix image URL
                                        const imageUrl = image.imageUrl.startsWith('http') 
                                          ? image.imageUrl 
                                          : `http://localhost:5000${image.imageUrl}`;
                                        
                                        // Debug log
                                        console.log('Image URL:', imageUrl, 'Original:', image.imageUrl);
                                        
                                        return (
                                          <div key={imgIndex} className="relative group">
                                            <img
                                              src={imageUrl}
                                              alt={`Evidence ${imgIndex + 1}`}
                                              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                                              onClick={() => viewImage({...image, imageUrl})}
                                              onError={(e) => {
                                                e.target.src = createPlaceholderImage(48, 48);
                                              }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                              <div className="flex space-x-1">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    viewImage({...image, imageUrl});
                                                  }}
                                                  className="p-1 bg-blue-500 rounded hover:bg-blue-600"
                                                  title="View Image"
                                                >
                                                  <ZoomIn className="w-2 h-2 text-white" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadImage({...image, imageUrl});
                                                  }}
                                                  className="p-1 bg-green-500 rounded hover:bg-green-600"
                                                  title="Download Image"
                                                >
                                                  <DownloadCloud className="w-2 h-2 text-white" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {refund.images && refund.images.length > 4 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        +{refund.images.length - 4} more files
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center text-gray-400">
                                    <FileImage className="w-4 h-4 mr-1" />
                                    <span className="text-xs">No evidence</span>
                                  </div>
                                )}
                                
                                {/* Financial Impact */}
                                <div className="border-t pt-2 mt-2">
                                  <div className="text-xs text-gray-600">
                                    <div>Revenue: {refund.revenue}</div>
                                    <div>Partner: {refund.partnerEarnings}</div>
                                    <div className="font-medium text-red-600">Loss: {refund.companyLoss}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeCustomerModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Image Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Image className="w-6 h-6 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-black">Evidence Photo</h3>
                  <p className="text-gray-600">{selectedImage.originalName || selectedImage.filename}</p>
                </div>
              </div>
              <button
                onClick={closeImageModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Image Content */}
            <div className="p-4">
              <div className="flex justify-center">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.originalName || 'Evidence'}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = createPlaceholderImage(400, 300);
                  }}
                />
              </div>
              
              {/* Image Details */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">File Name:</label>
                    <p className="text-gray-900">{selectedImage.originalName || selectedImage.filename}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">Upload Date:</label>
                    <p className="text-gray-900">
                      {selectedImage.uploadedAt ? new Date(selectedImage.uploadedAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">File Size:</label>
                    <p className="text-gray-900">
                      {selectedImage.fileSize ? `${(selectedImage.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Modal Footer */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Download
                </button>
                <a
                  href={selectedImage.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </a>
              </div>
              <button
                onClick={closeImageModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Approval Modal */}
      {showApprovalModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Approval Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-black">Refund Decision</h3>
                  <p className="text-gray-600">Tracking ID: {selectedRefund.trackingId}</p>
                </div>
              </div>
              <button
                onClick={closeApprovalModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Approval Modal Content */}
            <div className="p-6 space-y-6">
              {/* Refund Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-black mb-3">Refund Request Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">Customer:</label>
                    <p className="text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">Amount:</label>
                    <p className="text-gray-900 font-semibold">{selectedRefund.refundAmount}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">Reason:</label>
                    <p className="text-gray-900">{selectedRefund.refundReason}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">Category:</label>
                    <p className="text-gray-900">{selectedRefund.refundCategory}</p>
                  </div>
                </div>
                {selectedRefund.refundDescription && (
                  <div className="mt-3">
                    <label className="font-medium text-gray-600">Description:</label>
                    <p className="text-gray-900 bg-white p-2 rounded border">{selectedRefund.refundDescription}</p>
                  </div>
                )}
              </div>

              {/* Evidence Preview */}
              {selectedRefund.hasImages && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-black mb-3">Evidence ({selectedRefund.imageCount} files)</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedRefund.images && selectedRefund.images.slice(0, 8).map((image, index) => {
                      const imageUrl = image.imageUrl.startsWith('http') 
                        ? image.imageUrl 
                        : `http://localhost:5000${image.imageUrl}`;
                      
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Evidence ${index + 1}`}
                            className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => viewImage({...image, imageUrl})}
                            onError={(e) => {
                              e.target.src = createPlaceholderImage(64, 64);
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Response / Notes
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => useAutoResponse('approve')}
                      className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Auto Approve Response
                    </button>
                    <button
                      onClick={() => useAutoResponse('reject')}
                      className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs"
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Auto Reject Response
                    </button>
                  </div>
                </div>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Enter your response or notes for this refund request... Or use auto-generate buttons above."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={6}
                /><div className="mt-2 text-xs text-gray-500">
                  💡 Tip: Use the auto-generate buttons above to create professional responses based on the refund category and reason.
                </div>
              </div>

              {/* Auto-Response Preview */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Auto-Generated Response Preview
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-green-700 mb-1">If Approved:</div>
                    <div className="text-xs text-gray-700 bg-green-50 p-2 rounded border-l-4 border-green-400">
                      {generateAutoResponse('approve', selectedRefund)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-red-700 mb-1">If Rejected:</div>
                    <div className="text-xs text-gray-700 bg-red-50 p-2 rounded border-l-4 border-red-400">
                      {generateAutoResponse('reject', selectedRefund)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200">
              <button
                onClick={closeApprovalModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRefundApproval('reject')}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject Refund
                </button>
                <button
                  onClick={() => handleRefundApproval('approve')}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}