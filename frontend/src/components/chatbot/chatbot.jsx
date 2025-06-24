'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Languages, FileText, BarChart3, AlertTriangle, Package } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m your AI Assistant. I can help you with reports, complaints, analytics, and much more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const quickActions = [
    { icon: <FileText className="w-4 h-4" />, text: 'Generate Report', action: 'report' },
    { icon: <BarChart3 className="w-4 h-4" />, text: 'Analytics', action: 'analytics' },
    { icon: <AlertTriangle className="w-4 h-4" />, text: 'Complaints', action: 'complaints' },
    { icon: <Package className="w-4 h-4" />, text: 'Shipment Status', action: 'shipment' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: generateBotResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('report') || input.includes('रिपोर्ट')) {
      return `📊 I can generate various reports for you:
      
• Daily Delivery Reports
• Customer Complaints Summary  
• Revenue Analytics
• Partner Performance
• Shipment Status Reports

Which specific report would you like me to generate?`;
    }
    
    if (input.includes('complaint') || input.includes('शिकायत')) {
      return `🚨 Complaint Management:

• Total Complaints Today: 23
• Pending Resolution: 8
• High Priority: 3
• Average Resolution Time: 2.4 hours

Would you like me to show detailed complaint analysis or create a complaint report?`;
    }
    
    if (input.includes('analytics') || input.includes('विश्लेषण')) {
      return `📈 Analytics Dashboard:

• Total Deliveries Today: 1,247
• Success Rate: 94.2%
• Average Delivery Time: 3.2 hours
• Customer Satisfaction: 4.6/5
• Revenue Today: $12,450

Need detailed analytics for any specific metric?`;
    }
    
    if (input.includes('shipment') || input.includes('शिपमेंट')) {
      return `📦 Shipment Overview:

• Active Shipments: 2,156
• In Transit: 1,890
• Out for Delivery: 266
• Delayed: 45
• Delivered Today: 1,247

Want to track a specific shipment or see detailed status?`;
    }

    return `I understand you're asking about "${userInput}". I can help you with:

🔹 Generate comprehensive reports
🔹 Analyze customer complaints  
🔹 Provide real-time analytics
🔹 Track shipment status
🔹 Monitor partner performance
🔹 Customer satisfaction metrics

Please let me know what specific information you need!`;
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      report: 'Generate a comprehensive daily report',
      analytics: 'Show me today\'s analytics dashboard',
      complaints: 'Display customer complaints summary',
      shipment: 'Show shipment status overview'
    };
    
    setInputMessage(actionMessages[action]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 p-2 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-slate-300">Admin Support Bot</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-700 text-white text-xs px-2 py-1 rounded border-none outline-none"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <Languages className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-xs text-slate-600 mb-2">Quick Actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center space-x-2 bg-white hover:bg-yellow-50 border border-slate-200 hover:border-yellow-300 p-2 rounded-lg text-xs transition-colors"
                >
                  {action.icon}
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-yellow-500' : 'bg-slate-600'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="w-4 h-4 text-white" /> : 
                      <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about reports, analytics, complaints..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}