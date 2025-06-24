'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Languages, FileText, BarChart3, AlertTriangle, Package, Download, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { chatbotService } from '@/services/chatbot.service';

export default function EnhancedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle welcome message animation when chatbot opens
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      setIsTyping(true);
      
      // Show typing animation for 2 seconds, then display welcome message
      const timer = setTimeout(() => {
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          message: 'Hello! I\'m your Admin Assistant. I can help you with:\n\n📊 Today\'s performance stats\n🚨 Pending issues & complaints\n📦 Live order tracking\n👥 Partner performance\n\nTry the quick actions below or ask me anything!',
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        setIsTyping(false);
        setHasShownWelcome(true);
      }, 2000); // 2 second typing animation
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasShownWelcome]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Get context data for better AI responses
      const context = await getContextData(inputMessage);
      
      // Send to AI service
      const response = await chatbotService.sendMessage(inputMessage, selectedLanguage, context);
      
      if (response.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          message: response.message,
          timestamp: new Date(),
          data: response.data // Additional data like charts, reports
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment, or contact support if the issue persists.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const getContextData = async (message) => {
    const context = {};
    const lowerMessage = message.toLowerCase();

    try {
      // Get relevant data based on message content
      if (lowerMessage.includes('report') || lowerMessage.includes('रिपोर्ट')) {
        context.reports = await chatbotService.getAdminReports('daily');
      }
      
      if (lowerMessage.includes('complaint') || lowerMessage.includes('शिकायत')) {
        context.complaints = await chatbotService.getComplaints('pending');
      }
      
      if (lowerMessage.includes('analytics') || lowerMessage.includes('विश्लेषण')) {
        context.analytics = await chatbotService.getAnalytics('today');
      }
    } catch (error) {
      console.error('Error getting context data:', error);
    }

    return context;
  };

  
  const downloadChatHistory = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
      messages: messages.map(msg => ({
        type: msg.type,
        message: msg.message,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save to backend
    chatbotService.saveChatHistory(messages);
  };

  const clearChat = () => {
    setMessages([]);
    setHasShownWelcome(false);
    setIsTyping(false);
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
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[650px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Admin Assistant</h3>
                  <p className="text-xs text-slate-300">Smart Support Bot</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={downloadChatHistory}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Download Chat History"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearChat}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Clear Chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="mt-3 flex items-center space-x-2">
              <Languages className="w-4 h-4 text-yellow-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-700 text-white text-xs px-2 py-1 rounded border-none outline-none flex-1"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.message}</p>
                    
                    {/* Additional data rendering */}
                    {message.data && (
                      <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(message.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                      : 'bg-gradient-to-r from-slate-600 to-slate-700'
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
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-slate-600 to-slate-700">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
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
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me anything about reports, analytics, complaints, shipments..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm resize-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-slate-300 disabled:to-slate-400 text-white p-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Smart Assistant • Multi-language • Real-time Data
            </p>
          </div>
        </div>
      )}
    </>
  );
}