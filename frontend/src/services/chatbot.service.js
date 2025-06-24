// Chatbot Service for API Integration

class ChatbotService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.openAIKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    this.geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }

  // Send message to AI (OpenAI GPT or Google Gemini)
  async sendMessage(message, language = 'en', context = {}) {
    try {
      // First try to use backend Gemini API
      try {
        return await this.sendToBackend(message, language, context);
      } catch (backendError) {
        console.warn('Backend API failed, trying fallback:', backendError.message);
      }
      
      // Fallback to demo responses if backend fails
      return await this.sendDemoResponse(message, language, context);
      
    } catch (error) {
      console.error('Chatbot service error:', error);
      return {
        success: false,
        response: 'Sorry, I\'m having trouble processing your request. Please try again.',
        error: error.message
      };
    }
  }

  // Demo response for testing without API keys
  async sendDemoResponse(message, language, context) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Check if this is a complaint bot context
    if (context.isComplaintBot) {
      return this.getComplaintBotResponse(message, context);
    }
    
    const { getResponse } = await import('../components/chatbot/demo-responses.js');
    const response = getResponse(message);
    
    return {
      success: true,
      response: response,
      data: context,
      isDemoMode: true
    };
  }

  // Specialized responses for complaint bot
  getComplaintBotResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Detect complaint intent
    const complaintKeywords = ['problem', 'issue', 'complaint', 'delay', 'damaged', 'wrong', 'poor', 'bad', 'terrible', 'awful', 'broken', 'missing', 'lost', 'late', 'slow', 'rude', 'unprofessional'];
    const trackingKeywords = ['track', 'tracking', 'where', 'status', 'location', 'find'];
    const supportKeywords = ['help', 'support', 'contact', 'phone', 'email', 'speak', 'talk'];
    
    const isComplaint = complaintKeywords.some(keyword => lowerMessage.includes(keyword));
    const isTracking = trackingKeywords.some(keyword => lowerMessage.includes(keyword));
    const isSupport = supportKeywords.some(keyword => lowerMessage.includes(keyword));
    
    let response = '';
    let intent = 'general';
    let needsComplaintForm = false;
    
    if (isComplaint) {
      intent = 'complaint';
      needsComplaintForm = true;
      
      if (lowerMessage.includes('delay') || lowerMessage.includes('late') || lowerMessage.includes('slow')) {
        response = "I understand your package delivery is delayed. This is definitely frustrating, and I want to help resolve this issue for you. Delivery delays can happen due to various reasons like weather, high volume, or logistical challenges.";
      } else if (lowerMessage.includes('damaged') || lowerMessage.includes('broken')) {
        response = "I'm sorry to hear your package arrived damaged. This is unacceptable, and we take package safety very seriously. We need to address this immediately to ensure you receive a replacement or compensation.";
      } else if (lowerMessage.includes('wrong') || lowerMessage.includes('incorrect')) {
        response = "I apologize for the delivery to the wrong address. This is a serious issue that affects our service quality. We need to locate your package and ensure it reaches the correct destination.";
      } else if (lowerMessage.includes('rude') || lowerMessage.includes('unprofessional') || lowerMessage.includes('poor')) {
        response = "I'm sorry you experienced poor service from our team. Professional and courteous service is our standard, and I want to ensure this issue is addressed properly with our delivery partners.";
      } else if (lowerMessage.includes('missing') || lowerMessage.includes('lost')) {
        response = "A missing package is a serious concern, and I understand how worrying this must be. We need to investigate this immediately and track down what happened to your shipment.";
      } else {
        response = "I understand you're experiencing an issue with our service. Every customer concern is important to us, and I want to make sure we address your problem properly and promptly.";
      }
    } else if (isTracking) {
      intent = 'tracking';
      response = "I can help you track your package. To provide you with accurate tracking information, I'll need your tracking ID. Once you provide it, I can check the current status and location of your shipment.";
    } else if (isSupport) {
      intent = 'support';
      response = "I'm here to help you with any questions or concerns. You can reach our support team directly, or I can assist you right now. What specific issue would you like help with?";
    } else {
      // General conversational response
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        response = "Hello! I'm here to assist you with any courier-related concerns. Whether you need to track a package, report an issue, or get support, I'm ready to help.";
      } else if (lowerMessage.includes('thank')) {
        response = "You're welcome! I'm glad I could help. If you have any other questions or concerns about your deliveries, feel free to ask anytime.";
      } else {
        response = "I'm your AI assistant for Prime Dispatcher. I can help you with package tracking, delivery complaints, or connect you with our support team. What would you like assistance with today?";
      }
    }
    
    return {
      success: true,
      response: response,
      intent: intent,
      needsComplaintForm: needsComplaintForm,
      isDemoMode: true
    };
  }

  // OpenAI GPT Integration
  async sendToOpenAI(message, language, context) {
    const systemPrompt = this.getSystemPrompt(language, context);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openAIKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        response: data.choices[0].message.content,
        usage: data.usage
      };
    } else {
      throw new Error(data.error?.message || 'OpenAI API error');
    }
  }

  // Google Gemini Integration
  async sendToGemini(message, language, context) {
    const systemPrompt = this.getSystemPrompt(language, context);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${message}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        response: data.candidates[0].content.parts[0].text,
        usage: data.usageMetadata
      };
    } else {
      throw new Error('Gemini API error');
    }
  }

  // Your Backend API Integration
  async sendToBackend(message, language, context) {
    const response = await fetch(`${this.baseURL}/gemini/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        context: {
          ...context,
          language,
          isComplaintBot: true,
          companyName: 'Prime Dispatcher',
          services: ['package tracking', 'delivery complaints', 'customer support']
        }
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Analyze the response to detect intent
      const lowerResponse = data.response.toLowerCase();
      const lowerMessage = message.toLowerCase();
      
      let intent = 'general';
      let needsComplaintForm = false;
      
      // Detect complaint intent
      const complaintKeywords = ['problem', 'issue', 'complaint', 'delay', 'damaged', 'wrong', 'poor', 'bad', 'terrible', 'awful', 'broken', 'missing', 'lost', 'late', 'slow', 'rude', 'unprofessional'];
      const isComplaint = complaintKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (isComplaint) {
        intent = 'complaint';
        needsComplaintForm = true;
      }
      
      return {
        success: true,
        response: data.response,
        intent: intent,
        needsComplaintForm: needsComplaintForm,
        timestamp: data.timestamp
      };
    } else {
      throw new Error(data.message || 'Backend API error');
    }
  }

  // Get system prompt based on language and context
  getSystemPrompt(language, context = {}) {
    if (context.isComplaintBot) {
      return this.getComplaintBotSystemPrompt(language);
    }
    
    const prompts = {
      en: `You are an AI assistant for Prime Dispatcher, a courier and logistics company. You help admin users with:

1. REPORTS: Generate daily/weekly/monthly reports on deliveries, revenue, complaints, partner performance
2. ANALYTICS: Provide insights on delivery success rates, customer satisfaction, operational metrics
3. COMPLAINTS: Analyze customer complaints, categorize issues, suggest solutions
4. SHIPMENT TRACKING: Real-time status updates, delivery predictions, route optimization
5. PARTNER MANAGEMENT: Monitor partner performance, earnings, delivery statistics
6. CUSTOMER SUPPORT: Handle customer queries, escalate issues, provide solutions

Always respond professionally and provide actionable insights. Use emojis and formatting to make responses clear and engaging.`,

      hi: `आप Prime Dispatcher के लिए एक AI असिस्टेंट हैं, जो एक कूरियर और लॉजिस्टिक्स कंपनी है। आप एडमिन यूजर्स की मदद करते हैं:

1. रिपोर्ट्स: डिलीवरी, रेवेन्यू, शिकायतों, पार्टनर परफॉर्मेंस की रिपोर्ट्स बनाना
2. एनालिटिक्स: डिलीवरी सक्सेस रेट, कस्टमर सैटिस्फैक्शन, ऑपरेशनल मेट्रिक्स की जानकारी
3. शिकायतें: कस्टमर शिकायतों का विश्लेषण, समस्याओं का वर्गीकरण, समाधान सुझाना
4. शिपमेंट ट्रैकिंग: रियल-टाइम स्टेटस अपडेट, डिलीवरी प्रेडिक्शन
5. पार्टनर मैनेजमेंट: पार्टनर परफॉर्मेंस, कमाई, डिलीवरी स्टेटिस्टिक्स मॉनिटर करना

हमेशा प्रोफेशनल तरीके से जवाब दें और व्यावहारिक सुझाव दें।`,

      es: `Eres un asistente de IA para Prime Dispatcher, una empresa de mensajería y logística. Ayudas a usuarios administradores con:

1. INFORMES: Generar reportes diarios/semanales/mensuales sobre entregas, ingresos, quejas
2. ANÁLISIS: Proporcionar insights sobre tasas de éxito, satisfacción del cliente
3. QUEJAS: Analizar quejas de clientes, categorizar problemas, sugerir soluciones
4. SEGUIMIENTO: Actualizaciones de estado en tiempo real, predicciones de entrega

Siempre responde profesionalmente y proporciona insights accionables.`
    };

    return prompts[language] || prompts.en;
  }

  // Get complaint bot specific system prompt
  getComplaintBotSystemPrompt(language) {
    const prompts = {
      en: `You are an AI Customer Support Assistant for Prime Dispatcher, a courier and logistics company. You help customers with:

1. COMPLAINTS: Listen to customer issues, show empathy, and guide them to file formal complaints
2. PACKAGE TRACKING: Help customers track their shipments and provide status updates
3. DELIVERY ISSUES: Address problems like delays, damaged packages, wrong addresses, poor service
4. SUPPORT: Provide contact information and escalate issues to human support when needed

IMPORTANT GUIDELINES:
- Always be empathetic and understanding when customers express frustration
- If a customer describes a problem, acknowledge it and offer to help file a complaint
- Use natural, conversational language - not robotic responses
- Show genuine concern for their issues
- When you detect a complaint, respond with empathy first, then offer to collect their information for admin follow-up
- Be professional but friendly and approachable
- Don't use too many emojis - keep it professional

COMPLAINT DETECTION: If the customer mentions problems like delays, damage, wrong delivery, poor service, missing packages, or expresses dissatisfaction, treat it as a complaint and offer to help them file it officially.`,

      hi: `आप Prime Dispatcher के लिए एक AI कस्टमर सपोर्ट असिस्टेंट हैं। आप ग्राहकों की मदद करते हैं:

1. शिकायतें: ग्राहकों की समस्याओं को सुनना और औपचारिक शिकायत दर्ज करने में मदद करना
2. पैकेज ट्रैकिंग: शिपमेंट ट्रैक करने में मदद करना
3. डिलीवरी समस्याएं: देरी, क्षतिग्रस्त पैकेज, गलत पता जैसी समस्याओं का समाधान
4. सहायता: संपर्क जानकारी प्रदान करना

हमेशा सहानुभूति दिखाएं और ग्राहकों की समस्याओं को समझें।`
    };

    return prompts[language] || prompts.en;
  }

  // Get admin reports
  async getAdminReports(type = 'daily') {
    try {
      const response = await fetch(`${this.baseURL}/admin/reports/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      return null;
    }
  }

  // Get complaints data
  async getComplaints(status = 'all') {
    try {
      const response = await fetch(`${this.baseURL}/admin/complaints?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return null;
    }
  }

  // Get analytics data
  async getAnalytics(period = 'today') {
    try {
      const response = await fetch(`${this.baseURL}/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  // Save chat conversation
  async saveChatHistory(messages) {
    try {
      await fetch(`${this.baseURL}/admin/chat-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messages,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
}

export const chatbotService = new ChatbotService();