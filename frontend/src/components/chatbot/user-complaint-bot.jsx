'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle, Package, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaint.service';
import { chatbotService } from '@/services/chatbot.service';

export default function UserComplaintBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: '',
    trackingId: ''
  });
  const [complaintCategory, setComplaintCategory] = useState('');
  const [isCollectingInfo, setIsCollectingInfo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const complaintCategories = [
    { id: 'delivery_delay', name: 'Delivery Delay', description: 'Package delivery is taking longer than expected' },
    { id: 'damaged_package', name: 'Damaged Package', description: 'Package arrived in damaged or broken condition' },
    { id: 'wrong_address', name: 'Incorrect Delivery Address', description: 'Package was delivered to the wrong location' },
    { id: 'poor_service', name: 'Service Quality Issue', description: 'Unsatisfactory delivery service experience' },
    { id: 'payment_issue', name: 'Payment or Billing Issue', description: 'Problems with payment processing or billing' },
    { id: 'other', name: 'Other Issue', description: 'Issue not covered by the above categories' }
  ];

  const quickActions = [
    {
      icon: <Package className="w-4 h-4" />,
      text: 'Track Package',
      description: 'Get real-time updates on your shipment status',
      action: 'track_package',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      text: 'Report Issue',
      description: 'File a complaint about delivery problems',
      action: 'file_complaint',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      icon: <Phone className="w-4 h-4" />,
      text: 'Contact Support',
      description: 'Speak with our customer service team',
      action: 'contact_support',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    }
  ];

  const infoSteps = [
    { field: 'name', question: 'What is your full name?', placeholder: 'Enter your full name' },
    { field: 'phone', question: 'What is your phone number?', placeholder: 'Enter phone number' },
    { field: 'email', question: 'What is your email address? (Optional)', placeholder: 'Email address (optional)' },
    { field: 'trackingId', question: 'Do you have a tracking ID? (Optional)', placeholder: 'Tracking ID (optional)' }
  ];

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
          type: 'bot',
          message: 'Welcome to Prime Dispatcher Customer Support.\n\nI am your virtual assistant, available 24/7 to help you with:\n\n• Package tracking and status updates\n• Delivery issue reporting\n• Complaint filing and resolution\n• Customer service contact information\n\nPlease select an option below or describe how I can assist you today.',
          timestamp: new Date(),
          showQuickActions: true
        };
        
        setMessages([welcomeMessage]);
        setIsTyping(false);
        setHasShownWelcome(true);
      }, 2000); // 2 second typing animation
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasShownWelcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type, message, options = {}) => {
    const newMessage = {
      type,
      message,
      timestamp: new Date(),
      ...options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'track_package':
        addMessage('user', 'I need to track my package');
        handleTrackingRequest();
        break;
      case 'file_complaint':
        addMessage('user', 'I want to file a complaint');
        startComplaintProcess();
        break;
      case 'contact_support':
        addMessage('user', 'I need to contact support');
        handleSupportRequest();
        break;
    }
  };

  const handleTrackingRequest = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'I will help you track your package.\n\nPlease enter your tracking ID below to retrieve the latest status and location information for your shipment.', {
        showTrackingInput: true
      });
    }, 300); // Reduced delay from 1000ms to 300ms
  };

  const handleTrackingSubmit = async (trackingId) => {
    if (!trackingId.trim()) return;
    
    addMessage('user', trackingId);
    setIsTyping(true);
    
    try {
      // Fetch tracking data from backend using the correct verify endpoint
      const response = await fetch(`http://localhost:5000/api/tracking/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackingId })
      });
      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (response.ok && data.trackingId) {
          // The verify endpoint returns the tracking data directly
          const tracking = data;
          const statusEmoji = {
            'pending': '⏳',
            'confirmed': '✅',
            'picked_up': '📦',
            'in_transit': '🚚',
            'out_for_delivery': '🚛',
            'delivered': '✅',
            'cancelled': '❌'
          };
          
          const trackingMessage = `Tracking Information for ${trackingId}\n\n` +
            `Status: ${tracking.status?.replace('_', ' ').toUpperCase() || 'Unknown'}\n` +
            `Current Location: ${tracking.currentLocation || 'Not updated'}\n` +
            `Last Updated: ${new Date(tracking.updatedAt || tracking.createdAt).toLocaleString()}\n` +
            `Origin: ${tracking.origin || tracking.sender?.city || 'N/A'}\n` +
            `Destination: ${tracking.destination || tracking.receiver?.city || 'N/A'}\n\n` +
            (tracking.status?.toLowerCase() === 'delivered' ? 
              'Your package has been successfully delivered.' :
              tracking.status?.toLowerCase() === 'out_for_delivery' ?
              'Your package is currently out for delivery and will arrive today.' :
              'You will receive automatic updates as your package progresses through our delivery network.');
          
          addMessage('bot', trackingMessage);
        } else {
          addMessage('bot', `Tracking ID Not Found\n\nNo shipment record was found for tracking ID: ${trackingId}\n\nPlease verify:\n• The tracking ID is entered correctly\n• There are no extra spaces or characters\n• Contact customer support if you continue to experience issues: support@primedispatcher.com`);
        }
      }, 200); // Very fast response
      
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', `System Temporarily Unavailable\n\nOur tracking system is currently experiencing technical difficulties. Please try again in a few moments.\n\nIf the issue persists, contact our support team:\n\nPhone: +92-XXX-XXXXXXX\nEmail: support@primedispatcher.com`);
      }, 200);
    }
  };

  const startComplaintProcess = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'I understand you are experiencing an issue with your delivery. I will help you file a formal complaint with our administrative team.\n\nTo ensure proper handling of your concern, please select the category that best describes your issue:', {
        showCategories: true
      });
    }, 400); // Reduced delay
  };

  const handleSupportRequest = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'Here are the available contact methods for our customer support team:\n\nPhone: +92-XXX-XXXXXXX\nEmail: support@primedispatcher.com\nBusiness Hours: 9 AM - 6 PM (Monday - Saturday)\nLive Chat: Available through this interface\n\nFor immediate assistance with specific delivery issues, I can also help you file a priority complaint with our administrative team.');
    }, 400); // Reduced delay
  };

  const handleCategorySelect = (category) => {
    setComplaintCategory(category.id);
    addMessage('user', `My complaint: ${category.name}`);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'Thank you for providing this information. I will now process your complaint with our administrative team. To ensure proper follow-up, I need to collect some contact details:');
      setIsCollectingInfo(true);
      setCurrentStep(0);
      askNextQuestion();
    }, 500);
  };

  const askNextQuestion = () => {
    if (currentStep < infoSteps.length) {
      const step = infoSteps[currentStep];
      addMessage('bot', step.question, {
        showInput: true,
        inputPlaceholder: step.placeholder,
        inputField: step.field
      });
    } else {
      submitComplaint();
    }
  };

  const handleInfoInput = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    addMessage('user', value || 'Skip');
    
    setCurrentStep(prev => prev + 1);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      askNextQuestion();
    }, 400);
  };

  const submitComplaint = async () => {
    setIsTyping(true);
    
    const complaintData = {
      category: complaintCategory,
      userInfo,
      messages: messages.filter(m => m.type === 'user').map(m => m.message),
      description: messages.filter(m => m.type === 'user').map(m => m.message).join(' | '),
      priority: complaintCategory === 'damaged_package' ? 'high' : 'medium'
    };

    try {
      // Send complaint to admin using complaint service
      const result = await complaintService.submitComplaint(complaintData);
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (result.success) {
          addMessage('bot', `Complaint Successfully Submitted\n\nComplaint ID: ${result.complaintId}\nExpected Response Time: Within 24 hours\nUpdates: You will receive status updates via email and SMS\n\nOur administrative team will review your complaint and take appropriate action. A customer service representative will contact you shortly.\n\nIs there anything else I can assist you with today?`, {
            isComplaintConfirmation: true
          });
          
          toast.success('Complaint submitted successfully!');
        } else {
          addMessage('bot', 'Submission Error\n\nWe encountered an issue while processing your complaint. Please try submitting again, or contact our customer support team directly for immediate assistance.');
          toast.error('Error submitting complaint!');
        }
        
        setIsCollectingInfo(false);
        setCurrentStep(0);
        setComplaintCategory('');
        setUserInfo({ name: '', phone: '', email: '', trackingId: '' });
      }, 2000);
      
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', 'System Error\n\nWe are currently experiencing technical difficulties with our complaint submission system. Please try again in a few moments, or contact our customer support team directly for immediate assistance.');
        toast.error('Error submitting complaint!');
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);

    setIsTyping(true);

    try {
      // Create context for AI
      const context = {
        isComplaintBot: true,
        companyName: 'Prime Dispatcher',
        services: ['package tracking', 'delivery complaints', 'customer support'],
        previousMessages: messages.slice(-5) // Last 5 messages for context
      };

      // Get AI response
      const aiResponse = await chatbotService.sendMessage(userMessage, 'en', context);
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (aiResponse.success) {
          addMessage('bot', aiResponse.response);
          
          // Check if AI detected a complaint and auto-process it
          if (aiResponse.intent === 'complaint' || aiResponse.needsComplaintForm) {
            setTimeout(() => {
              addMessage('bot', 'I will assist you in filing a formal complaint with our administrative team. To ensure proper processing and follow-up, I need to collect some contact information.');
              setIsCollectingInfo(true);
              setCurrentStep(0);
              
              // Auto-categorize the complaint
              const category = complaintService.categorizeComplaint(userMessage);
              setComplaintCategory(category.category);
              
              askNextQuestion();
            }, 800); // Reduced delay
          }
        } else {
          // Fallback to simple logic if AI fails
          handleFallbackResponse(userMessage);
        }
      }, 500); // Reduced main delay
      
    } catch (error) {
      console.error('AI response error:', error);
      setTimeout(() => {
        setIsTyping(false);
        handleFallbackResponse(userMessage);
      }, 500);
    }
  };

  const handleFallbackResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('track') || lowerMessage.includes('tracking')) {
      handleTrackingRequest();
    } else if (lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('delay') || lowerMessage.includes('damage') || lowerMessage.includes('wrong') || lowerMessage.includes('poor')) {
      addMessage('bot', 'I understand you have a service concern. I will assist you in filing a formal complaint with our administrative team.');
      setTimeout(() => {
        startComplaintProcess();
      }, 500);
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      handleSupportRequest();
    } else {
      addMessage('bot', 'I am here to assist you with courier and delivery services. I can help you track packages, file service complaints, or provide customer support contact information. Please let me know how I can assist you today.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 border border-slate-600"
          title="Customer Support"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Prime Dispatcher Support</h3>
                  <p className="text-xs text-slate-300">Virtual Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-slate-700 p-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${
                  msg.type === 'user' 
                    ? 'bg-slate-800 text-white rounded-2xl rounded-br-md px-4 py-3' 
                    : 'bg-white text-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100'
                }`}>
                  {msg.type === 'bot' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-slate-600" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Support Assistant</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
                      
                      {/* Show quick actions only for general help */}
                      {msg.showQuickActions && (
                        <div className="mt-4 space-y-2">
                          <div className="text-xs text-slate-500 font-medium mb-3">Available Services:</div>
                          {quickActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickAction(action.action)}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm bg-white hover:bg-gray-50"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                {action.icon}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-sm text-slate-800">{action.text}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{action.description}</div>
                              </div>
                              <div className="flex-shrink-0">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Show input for info collection */}
                      {msg.showInput && (
                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder={msg.inputPlaceholder}
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm text-black bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleInfoInput(msg.inputField, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      )}
                      
                      {/* Show tracking input */}
                      {msg.showTrackingInput && (
                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Enter your tracking ID"
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm text-black bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleTrackingSubmit(e.target.value);
                                e.target.value = '';
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      )}
                      
                      {msg.type === 'user' && (
                      <p className="text-xs text-slate-300 mt-2 text-right">
                        {msg.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                    {msg.type === 'bot' && (
                      <p className="text-xs text-slate-400 mt-2">
                        {msg.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-slate-600" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!isCollectingInfo && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm text-black bg-white placeholder-gray-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors flex items-center justify-center min-w-[48px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}