'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  Package, 
  Phone, 
  Mail, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { complaintService } from '@/services/complaint.service';
import { chatbotService } from '@/services/chatbot.service';
import { API_URL } from '../../services/api.config.js';

export default function UserComplaintBot() {
  const pathname = usePathname();
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
    { id: 'delivery_delay', name: 'Delivery Delay', description: 'Consignment transit exceeded scheduled delivery window' },
    { id: 'damaged_package', name: 'Damaged Consignment', description: 'Package arrived with exterior or interior damage' },
    { id: 'wrong_address', name: 'Address Discrepancy', description: 'Package delivered to an incorrect location' },
    { id: 'poor_service', name: 'Courier Service Quality', description: 'Unsatisfactory handling or courier conduct' },
    { id: 'payment_issue', name: 'Billing / Freight Charge', description: 'Discrepancy in freight charges or billing' },
    { id: 'other', name: 'General Dispute', description: 'Inquiry not categorized above' }
  ];

  const quickActions = [
    {
      icon: <Package className="w-3.5 h-3.5" />,
      text: 'Track Shipment',
      action: 'track_package',
    },
    {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      text: 'Report Dispute',
      action: 'file_complaint',
    },
    {
      icon: <Phone className="w-3.5 h-3.5" />,
      text: 'Operations Desk',
      action: 'contact_support',
    }
  ];

  const infoSteps = [
    { field: 'name', question: 'Please enter your full contact name:', placeholder: 'Contact full name' },
    { field: 'phone', question: 'Please enter your contact phone number for updates:', placeholder: 'Phone number' },
    { field: 'email', question: 'Please enter your email address (optional):', placeholder: 'Email address' },
    { field: 'trackingId', question: 'Enter tracking reference ID if available (optional):', placeholder: 'e.g. TRK-7849102' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle welcome message when chatbot opens
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      setIsTyping(true);
      
      const timer = setTimeout(() => {
        const welcomeMessage = {
          type: 'bot',
          message: 'Welcome to Prime Dispatcher Operations Support.\n\nHow may we assist with your shipment today?',
          timestamp: new Date(),
          showQuickActions: true
        };
        
        setMessages([welcomeMessage]);
        setIsTyping(false);
        setHasShownWelcome(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasShownWelcome]);

  // Close console on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
        addMessage('user', 'Track shipment');
        handleTrackingRequest();
        break;
      case 'file_complaint':
        addMessage('user', 'Report a delivery dispute');
        startComplaintProcess();
        break;
      case 'contact_support':
        addMessage('user', 'Contact operations helpdesk');
        handleSupportRequest();
        break;
    }
  };

  const handleTrackingRequest = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'Please provide your consignment tracking ID to retrieve real-time telemetry:', {
        showTrackingInput: true
      });
    }, 250);
  };

  const handleTrackingSubmit = async (trackingId) => {
    const cleanId = trackingId ? trackingId.trim() : '';
    if (!cleanId) return;
    
    addMessage('user', cleanId);
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_URL}/tracking/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackingId: cleanId })
      });
      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (response.ok && data.trackingId) {
          const tracking = data;
          const statusText = (tracking.status || 'IN_TRANSIT').replace('_', ' ').toUpperCase();
          const trackingMessage = `Shipment Telemetry: ${cleanId}\n\n` +
            `• Status: ${statusText}\n` +
            `• Current Location: ${tracking.currentLocation || 'Central Logistics Hub'}\n` +
            `• Origin: ${tracking.origin || tracking.sender?.city || 'Origin Facility'}\n` +
            `• Destination: ${tracking.destination || tracking.receiver?.city || 'Destination Facility'}\n` +
            `• Last Sync: ${new Date(tracking.updatedAt || tracking.createdAt).toLocaleString()}\n\n` +
            (tracking.status?.toLowerCase() === 'delivered' ? 
              'Consignment delivered to recipient.' :
              tracking.status?.toLowerCase() === 'out_for_delivery' ?
              'Consignment dispatched with courier driver for final delivery today.' :
              'Consignment is moving through the automated transport network.');
          
          addMessage('bot', trackingMessage);
        } else {
          addMessage('bot', `Consignment Not Found\n\nNo active record matches reference "${cleanId}". Please verify the tracking number or contact operations at support@primedispatcher.com.`);
        }
      }, 300);
      
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', 'Telemetry Service Notice\n\nUnable to fetch telemetry data currently. Please try again shortly or contact support@primedispatcher.com.');
      }, 300);
    }
  };

  const startComplaintProcess = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'Select the appropriate category to register an official operations dispute:', {
        showCategories: true
      });
    }, 250);
  };

  const handleSupportRequest = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'Prime Dispatcher Operations Helpdesk:\n\n• Email: support@primedispatcher.com\n• Operations Window: 24/7 Operations Desk\n• Direct Dispute Intake: Available via this interface\n\nFor active consignments, select "Report Dispute" to log a priority inquiry.');
    }, 250);
  };

  const handleCategorySelect = (category) => {
    setComplaintCategory(category.id);
    addMessage('user', `Category: ${category.name}`);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', 'Thank you. Please provide your contact details to record this dispute in the operations queue:');
      setIsCollectingInfo(true);
      setCurrentStep(0);
      askNextQuestion();
    }, 300);
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
    }, 250);
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
      const result = await complaintService.submitComplaint(complaintData);
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (result.success) {
          addMessage('bot', `Dispute Ticket Logged\n\nTicket Reference: ${result.complaintId}\nStatus: Queued for Operations Review\nSLA: Resolution within 24 business hours\nNotifications: Updates will be sent to registered contact.\n\nOur operations team has logged your report and is investigating.`);
          toast.success('Dispute logged successfully');
        } else {
          addMessage('bot', 'Submission Notice\n\nUnable to log dispute automatically. Please contact our operations desk at support@primedispatcher.com.');
          toast.error('Unable to log dispute');
        }
        
        setIsCollectingInfo(false);
        setCurrentStep(0);
        setComplaintCategory('');
        setUserInfo({ name: '', phone: '', email: '', trackingId: '' });
      }, 800);
      
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', 'System Notice\n\nOperations ticketing is currently undergoing scheduled maintenance. Please email support@primedispatcher.com directly.');
        toast.error('Unable to log dispute');
      }, 800);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);

    setIsTyping(true);

    try {
      const context = {
        isComplaintBot: true,
        companyName: 'Prime Dispatcher',
        services: ['package tracking', 'delivery complaints', 'customer support'],
        previousMessages: messages.slice(-5)
      };

      const aiResponse = await chatbotService.sendMessage(userMessage, 'en', context);
      
      setTimeout(() => {
        setIsTyping(false);
        
        if (aiResponse.success) {
          addMessage('bot', aiResponse.response);
          
          if (aiResponse.intent === 'complaint' || aiResponse.needsComplaintForm) {
            setTimeout(() => {
              addMessage('bot', 'To initiate an official operations dispute, please provide your contact details:');
              setIsCollectingInfo(true);
              setCurrentStep(0);
              
              const category = complaintService.categorizeComplaint(userMessage);
              setComplaintCategory(category.category);
              
              askNextQuestion();
            }, 400);
          }
        } else {
          handleFallbackResponse(userMessage);
        }
      }, 350);
      
    } catch (error) {
      console.error('AI response error:', error);
      setTimeout(() => {
        setIsTyping(false);
        handleFallbackResponse(userMessage);
      }, 350);
    }
  };

  const handleFallbackResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('track') || lowerMessage.includes('tracking')) {
      handleTrackingRequest();
    } else if (lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('delay') || lowerMessage.includes('damage') || lowerMessage.includes('wrong') || lowerMessage.includes('poor')) {
      addMessage('bot', 'We will assist you in logging an official operations dispute.');
      setTimeout(() => {
        startComplaintProcess();
      }, 250);
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      handleSupportRequest();
    } else {
      addMessage('bot', 'Prime Dispatcher Support is available to assist you with tracking consignments, logging delivery disputes, or contacting the operations desk. How may we assist?');
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        type: 'bot',
        message: 'Welcome to Prime Dispatcher Operations Support.\n\nHow may we assist with your shipment today?',
        timestamp: new Date(),
        showQuickActions: true
      }
    ]);
    setIsCollectingInfo(false);
    setCurrentStep(0);
    setComplaintCategory('');
    setUserInfo({ name: '', phone: '', email: '', trackingId: '' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Sleek Enterprise Support Launcher FAB - Only shown when window is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-slate-950/25 border border-slate-700/80 bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Customer Support & Tracking"
            aria-label="Customer Support & Tracking"
          >
            <MessageSquare className="w-5 h-5 text-teal-400" />
            {/* Subtle operational indicator */}
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </button>
        </div>
      )}

      {/* Support Console Window - Grounded cleanly at bottom-right with single close button in header */}
      {isOpen && (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Executive Header */}
          <div className="bg-slate-900 text-white px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs tracking-tight text-white">Prime Support Desk</h3>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Automated Operations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={resetConversation}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-md transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${
                  msg.type === 'user' 
                    ? 'bg-slate-900 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-xs' 
                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs border border-slate-200/80'
                }`}>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-normal">
                    {msg.message}
                  </p>
                    
                  {/* Quick Action Chips */}
                  {msg.showQuickActions && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action.action)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors"
                        >
                          <span className="text-slate-500">{action.icon}</span>
                          <span>{action.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Complaint Categories Selection */}
                  {msg.showCategories && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                        Select Category
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {complaintCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat)}
                            className="w-full text-left px-2.5 py-2 rounded-lg border border-slate-200 hover:border-teal-600 bg-white hover:bg-teal-50/30 transition-all text-xs"
                          >
                            <span className="font-semibold text-slate-800 block">{cat.name}</span>
                            <span className="text-[10px] text-slate-500 block">{cat.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input for info collection */}
                  {msg.showInput && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        placeholder={msg.inputPlaceholder}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
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
                  
                  {/* Input for tracking */}
                  {msg.showTrackingInput && (
                    <div className="mt-2.5">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. TRK-7849102"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-mono uppercase"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleTrackingSubmit(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling;
                            if (input && input.value) {
                              handleTrackingSubmit(input.value);
                              input.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <p className={`text-[9px] mt-1.5 ${msg.type === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Subtle typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-xs px-3 py-2 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Messenger Input Footer */}
          {!isCollectingInfo && (
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message or tracking number..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs text-slate-900 bg-slate-50 placeholder-slate-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white p-2 rounded-xl transition-colors flex items-center justify-center flex-shrink-0"
                  title="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}