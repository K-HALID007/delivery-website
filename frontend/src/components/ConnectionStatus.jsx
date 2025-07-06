'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '../services/api.config.js';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    // Check browser online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check API connectivity
    const checkApiStatus = async () => {
      try {
        const response = await fetch('${API_URL}/health', {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('disconnected');
      }
      
      setLastCheck(new Date());
    };

    // Check immediately
    checkApiStatus();

    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (apiStatus === 'connected') return 'bg-green-500';
    if (apiStatus === 'checking') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (apiStatus === 'connected') return 'Connected';
    if (apiStatus === 'checking') return 'Checking...';
    return 'Disconnected';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${apiStatus === 'checking' ? 'animate-pulse' : ''}`}></div>
          <span className="text-white font-medium">{getStatusText()}</span>
          <span className="text-slate-400 text-xs">
            {lastCheck.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}