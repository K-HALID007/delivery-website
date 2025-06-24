// Complaint Service for handling user complaints and admin reporting

class ComplaintService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.complaints = []; // In-memory storage for demo (replace with actual database)
  }

  // Submit a new complaint from user
  async submitComplaint(complaintData) {
    try {
      // Send to backend API
      const response = await fetch(`${this.baseURL}/complaint/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaintData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          complaintId: data.complaintId,
          message: data.message || 'Complaint submitted successfully'
        };
      } else {
        throw new Error(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      // Fallback to demo mode if API fails
      const complaint = {
        id: `CMP-${Date.now()}`,
        ...complaintData,
        status: 'pending',
        timestamp: new Date().toISOString(),
        adminNotes: '',
        assignedTo: '',
        estimatedResolution: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      this.complaints.push(complaint);
      
      return {
        success: true,
        complaintId: complaint.id,
        message: 'Complaint submitted successfully (demo mode)'
      };
    }
  }

  // Get all complaints for admin dashboard
  async getComplaints(filters = {}) {
    try {
      // In a real app, this would be an API call with filters
      // const response = await fetch(`${this.baseURL}/admin/complaints?${new URLSearchParams(filters)}`);
      // return await response.json();

      // For demo, return stored complaints
      let filteredComplaints = [...this.complaints];

      if (filters.status && filters.status !== 'all') {
        filteredComplaints = filteredComplaints.filter(c => c.status === filters.status);
      }

      if (filters.priority && filters.priority !== 'all') {
        filteredComplaints = filteredComplaints.filter(c => c.priority === filters.priority);
      }

      return {
        success: true,
        complaints: filteredComplaints,
        total: filteredComplaints.length
      };
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return {
        success: false,
        complaints: [],
        total: 0
      };
    }
  }

  // Update complaint status
  async updateComplaintStatus(complaintId, status, adminNotes = '') {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${this.baseURL}/admin/complaints/${complaintId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status, adminNotes })
      // });

      // For demo, update in memory
      const complaintIndex = this.complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex !== -1) {
        this.complaints[complaintIndex] = {
          ...this.complaints[complaintIndex],
          status,
          adminNotes,
          updatedAt: new Date().toISOString()
        };

        // Notify customer about status update
        await this.notifyCustomer(this.complaints[complaintIndex]);
      }

      return {
        success: true,
        message: 'Complaint status updated successfully'
      };
    } catch (error) {
      console.error('Error updating complaint status:', error);
      return {
        success: false,
        message: 'Failed to update complaint status'
      };
    }
  }

  // Assign complaint to team member
  async assignComplaint(complaintId, assignedTo) {
    try {
      // In a real app, this would be an API call
      const complaintIndex = this.complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex !== -1) {
        this.complaints[complaintIndex] = {
          ...this.complaints[complaintIndex],
          assignedTo,
          updatedAt: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Complaint assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning complaint:', error);
      return {
        success: false,
        message: 'Failed to assign complaint'
      };
    }
  }

  // Get complaint statistics
  async getComplaintStats() {
    try {
      const total = this.complaints.length;
      const pending = this.complaints.filter(c => c.status === 'pending').length;
      const inProgress = this.complaints.filter(c => c.status === 'in_progress').length;
      const resolved = this.complaints.filter(c => c.status === 'resolved').length;
      const highPriority = this.complaints.filter(c => c.priority === 'high').length;

      return {
        success: true,
        stats: {
          total,
          pending,
          inProgress,
          resolved,
          highPriority,
          resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      return {
        success: false,
        stats: {}
      };
    }
  }

  // Notify admin about new complaint
  async notifyAdmin(complaint) {
    try {
      // In a real app, you would send email/SMS/push notification to admin
      console.log('🚨 New Complaint Alert for Admin:', {
        id: complaint.id,
        customer: complaint.userInfo.name,
        category: complaint.category,
        priority: complaint.priority,
        phone: complaint.userInfo.phone
      });

      // You can implement actual notification services here:
      // - Email service (SendGrid, Nodemailer, etc.)
      // - SMS service (Twilio, etc.)
      // - Push notifications
      // - Slack/Discord webhooks
      // - WhatsApp Business API

      return { success: true };
    } catch (error) {
      console.error('Error notifying admin:', error);
      return { success: false };
    }
  }

  // Notify customer about complaint status update
  async notifyCustomer(complaint) {
    try {
      // In a real app, you would send SMS/email to customer
      console.log('📱 Customer Notification:', {
        phone: complaint.userInfo.phone,
        email: complaint.userInfo.email,
        message: `Aapki complaint ${complaint.id} ka status update: ${complaint.status}`
      });

      // You can implement actual notification services here:
      // - SMS service for status updates
      // - Email notifications
      // - WhatsApp messages

      return { success: true };
    } catch (error) {
      console.error('Error notifying customer:', error);
      return { success: false };
    }
  }

  // Get complaint by ID
  async getComplaintById(complaintId) {
    try {
      const complaint = this.complaints.find(c => c.id === complaintId);
      
      if (!complaint) {
        return {
          success: false,
          message: 'Complaint not found'
        };
      }

      return {
        success: true,
        complaint
      };
    } catch (error) {
      console.error('Error fetching complaint:', error);
      return {
        success: false,
        message: 'Failed to fetch complaint'
      };
    }
  }

  // Export complaints data
  async exportComplaints(format = 'csv', filters = {}) {
    try {
      const { complaints } = await this.getComplaints(filters);
      
      if (format === 'csv') {
        const csvHeaders = [
          'Complaint ID',
          'Customer Name',
          'Phone',
          'Email',
          'Category',
          'Status',
          'Priority',
          'Date Created',
          'Assigned To',
          'Admin Notes'
        ];

        const csvRows = complaints.map(complaint => [
          complaint.id,
          complaint.userInfo.name,
          complaint.userInfo.phone,
          complaint.userInfo.email || '',
          complaint.category,
          complaint.status,
          complaint.priority,
          new Date(complaint.timestamp).toLocaleDateString(),
          complaint.assignedTo || '',
          complaint.adminNotes || ''
        ]);

        return {
          success: true,
          data: [csvHeaders, ...csvRows],
          filename: `complaints-${new Date().toISOString().split('T')[0]}.csv`
        };
      }

      return {
        success: true,
        data: complaints,
        filename: `complaints-${new Date().toISOString().split('T')[0]}.json`
      };
    } catch (error) {
      console.error('Error exporting complaints:', error);
      return {
        success: false,
        message: 'Failed to export complaints'
      };
    }
  }

  // Auto-categorize complaint based on message content
  categorizeComplaint(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('delay') || lowerMessage.includes('deri') || lowerMessage.includes('late')) {
      return { category: 'delivery_delay', priority: 'high' };
    }
    
    if (lowerMessage.includes('damage') || lowerMessage.includes('kharab') || lowerMessage.includes('broken')) {
      return { category: 'damaged_package', priority: 'high' };
    }
    
    if (lowerMessage.includes('address') || lowerMessage.includes('location') || lowerMessage.includes('galat')) {
      return { category: 'wrong_address', priority: 'medium' };
    }
    
    if (lowerMessage.includes('service') || lowerMessage.includes('behavior') || lowerMessage.includes('rude')) {
      return { category: 'poor_service', priority: 'medium' };
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('money') || lowerMessage.includes('paisa')) {
      return { category: 'payment_issue', priority: 'high' };
    }
    
    return { category: 'other', priority: 'medium' };
  }

  // Generate complaint report for admin
  async generateReport(period = 'daily') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const periodComplaints = this.complaints.filter(c => 
        new Date(c.timestamp) >= startDate
      );

      const report = {
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        totalComplaints: periodComplaints.length,
        byStatus: {
          pending: periodComplaints.filter(c => c.status === 'pending').length,
          inProgress: periodComplaints.filter(c => c.status === 'in_progress').length,
          resolved: periodComplaints.filter(c => c.status === 'resolved').length,
          closed: periodComplaints.filter(c => c.status === 'closed').length
        },
        byCategory: {
          delivery_delay: periodComplaints.filter(c => c.category === 'delivery_delay').length,
          damaged_package: periodComplaints.filter(c => c.category === 'damaged_package').length,
          wrong_address: periodComplaints.filter(c => c.category === 'wrong_address').length,
          poor_service: periodComplaints.filter(c => c.category === 'poor_service').length,
          payment_issue: periodComplaints.filter(c => c.category === 'payment_issue').length,
          other: periodComplaints.filter(c => c.category === 'other').length
        },
        byPriority: {
          high: periodComplaints.filter(c => c.priority === 'high').length,
          medium: periodComplaints.filter(c => c.priority === 'medium').length,
          low: periodComplaints.filter(c => c.priority === 'low').length
        }
      };

      return {
        success: true,
        report
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        message: 'Failed to generate report'
      };
    }
  }
}

export const complaintService = new ComplaintService();