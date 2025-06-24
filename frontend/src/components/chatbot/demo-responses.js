// Demo responses for testing chatbot without API keys

export const demoResponses = {
  // Report Generation
  'report': `📊 **Daily Delivery Report - ${new Date().toLocaleDateString()}**

**📈 Key Metrics:**
• Total Deliveries: 1,247
• Successful Deliveries: 1,174 (94.2%)
• Failed Deliveries: 73 (5.8%)
• Average Delivery Time: 3.2 hours

**💰 Revenue:**
• Total Revenue: $12,450
• Average Order Value: $9.98
• Payment Success Rate: 98.5%

**🚚 Partner Performance:**
• Top Performer: Partner #A123 (98% success)
• Needs Attention: Partner #B456 (87% success)
• Average Rating: 4.6/5

**📍 Geographic Breakdown:**
• Mumbai: 312 deliveries (96% success)
• Delhi: 298 deliveries (93% success)
• Bangalore: 267 deliveries (95% success)

Would you like me to generate a detailed report for any specific metric?`,

  // Analytics
  'analytics': `📈 **Real-Time Analytics Dashboard**

**🎯 Performance Metrics:**
• Delivery Success Rate: 94.2% ↗️ (+2.1%)
• Customer Satisfaction: 4.6/5 ⭐
• Average Response Time: 12 minutes
• First Attempt Success: 89.3%

**📊 Today's Statistics:**
• Orders Processed: 1,247
• Revenue Generated: $12,450
• Active Partners: 156
• Customer Queries: 89

**🔥 Trending Issues:**
1. Delayed deliveries in Zone-C (8 cases)
2. Address verification issues (12 cases)
3. Payment gateway timeouts (3 cases)

**💡 AI Insights:**
• Peak delivery time: 2-4 PM
• Highest success rate: Morning deliveries
• Recommended: Increase Zone-C partners

Need detailed analysis for any specific area?`,

  // Complaints
  'complaint': `🚨 **Customer Complaints Analysis**

**📋 Current Status:**
• Total Complaints Today: 23
• Pending Resolution: 8
• Resolved: 15
• High Priority: 3 🔴

**📊 Complaint Categories:**
1. **Delayed Delivery** (12 cases - 52%)
   - Average delay: 2.3 hours
   - Main cause: Traffic congestion
   
2. **Damaged Package** (6 cases - 26%)
   - Mostly fragile items
   - Packaging improvement needed
   
3. **Wrong Address** (3 cases - 13%)
   - Address verification issues
   
4. **Payment Issues** (2 cases - 9%)
   - Gateway timeouts

**⚡ Quick Actions Needed:**
• Contact customers with high-priority complaints
• Review packaging standards
• Optimize routes for Zone-C

**📈 Resolution Metrics:**
• Average Resolution Time: 2.4 hours
• Customer Satisfaction Post-Resolution: 4.2/5
• Repeat Complaint Rate: 3.1%

Would you like me to prioritize specific complaints or generate resolution strategies?`,

  // Shipment Status
  'shipment': `📦 **Shipment Status Overview**

**🚛 Active Shipments: 2,156**
• In Transit: 1,890 (87.7%)
• Out for Delivery: 266 (12.3%)
• Delayed: 45 (2.1%) ⚠️
• Delivered Today: 1,247

**📍 Geographic Distribution:**
• Mumbai Zone: 634 shipments
• Delhi Zone: 587 shipments  
• Bangalore Zone: 523 shipments
• Chennai Zone: 412 shipments

**⏰ Delivery Time Analysis:**
• On-Time Deliveries: 94.2%
• Early Deliveries: 12.8%
• Delayed Deliveries: 5.8%
• Average Delivery Time: 3.2 hours

**🚨 Attention Required:**
• 12 shipments delayed >4 hours
• 3 shipments with address issues
• 8 shipments in high-traffic zones

**📊 Partner Performance:**
• Best Performer: 98.5% success rate
• Average Performance: 94.2%
• Partners needing support: 3

**🔮 Predictions:**
• Expected deliveries in next 2 hours: 156
• Potential delays due to weather: 23
• Recommended route optimizations: 8

Need detailed tracking for specific shipments or zones?`,

  // Multi-language responses
  'hindi': `🙏 **नमस्ते! मैं आपका AI असिस्टेंट हूं**

**📊 आज की रिपोर्ट:**
• कुल डिलीवरी: 1,247
• सफल डिलीवरी: 1,174 (94.2%)
• कुल आय: ₹10,20,000
• ग्राहक संतुष्टि: 4.6/5

**🚨 शिकायतें:**
• कुल शिकायतें: 23
• हल की गई: 15
• बकाया: 8
• उच्च प्राथमिकता: 3

**📦 शिपमेंट स्थिति:**
• सक्रिय शिपमेंट: 2,156
• ट्रांजिट में: 1,890
• डिलीवरी के लिए: 266

क्या आपको किसी विशेष क्षेत्र की विस्तृत जानकारी चाहिए?`,

  // Default response
  'default': `🤖 **AI Assistant Ready!**

I can help you with:

**📊 Reports & Analytics**
• Daily/Weekly/Monthly reports
• Revenue analysis
• Performance metrics
• Custom data insights

**🚨 Complaint Management**
• Complaint categorization
• Priority assessment
• Resolution tracking
• Customer satisfaction

**📦 Shipment Tracking**
• Real-time status updates
• Delivery predictions
• Route optimization
• Partner performance

**🌍 Multi-Language Support**
• English, Hindi, Spanish, French
• Arabic, Chinese, German, Japanese
• Automatic language detection

**💡 Smart Features**
• Context-aware responses
• Data visualization
• Export capabilities
• Historical analysis

Just ask me anything! For example:
• "Generate today's delivery report"
• "Show customer complaints analysis"
• "What's the current shipment status?"
• "Provide analytics dashboard"`
};

export const getResponse = (input) => {
  const lowerInput = input.toLowerCase();
  
  // Today Stats / Performance
  if (lowerInput.includes('today') || lowerInput.includes('stats') || lowerInput.includes('performance')) {
    return demoResponses.analytics;
  }
  
  // Issues / Complaints
  if (lowerInput.includes('issues') || lowerInput.includes('complaint') || lowerInput.includes('pending') || lowerInput.includes('शिकायत')) {
    return demoResponses.complaint;
  }
  
  // Live Orders / Shipments
  if (lowerInput.includes('live') || lowerInput.includes('orders') || lowerInput.includes('shipment') || lowerInput.includes('active') || lowerInput.includes('deliveries')) {
    return demoResponses.shipment;
  }
  
  // Partners
  if (lowerInput.includes('partner') || lowerInput.includes('summary')) {
    return `👥 **Partner Performance Summary**

**🏆 Top Performers:**
• Partner #A123: 98.5% success rate (156 deliveries)
• Partner #B456: 96.2% success rate (142 deliveries)
• Partner #C789: 95.8% success rate (138 deliveries)

**📊 Overall Metrics:**
• Total Active Partners: 156
• Average Success Rate: 94.2%
• Average Rating: 4.6/5
• Total Deliveries Today: 1,247

**⚠️ Needs Attention:**
• Partner #D012: 87% success rate (needs support)
• Partner #E345: 89% success rate (training required)
• 3 partners with customer complaints

**💰 Earnings Summary:**
• Top Earner: $245 today
• Average Earnings: $89 per partner
• Total Partner Payouts: $13,884

**📈 Performance Trends:**
• Success rate improved by 2.1% this week
• Customer satisfaction up by 0.3 points
• Average delivery time reduced by 15 minutes

Would you like detailed analysis for any specific partner?`;
  }
  
  // Reports
  if (lowerInput.includes('report') || lowerInput.includes('रिपोर्ट')) {
    return demoResponses.report;
  }
  
  // Analytics
  if (lowerInput.includes('analytics') || lowerInput.includes('dashboard') || lowerInput.includes('विश्लेषण')) {
    return demoResponses.analytics;
  }
  
  // Hindi
  if (lowerInput.includes('hindi') || lowerInput.includes('हिंदी')) {
    return demoResponses.hindi;
  }
  
  return demoResponses.default;
};