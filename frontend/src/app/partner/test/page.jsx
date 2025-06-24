'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import partnerService from '../../../services/partner.service.js';

export default function PartnerTestPage() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const runTests = async () => {
    setLoading(true);
    setLogs([]);
    setTestResults({});

    addLog('🚀 Starting Partner Frontend Tests...', 'info');

    // Test 1: Check Authentication
    addLog('1️⃣ Testing Authentication...', 'info');
    const token = localStorage.getItem('partnerToken');
    const partnerData = localStorage.getItem('partnerData');
    
    if (token) {
      addLog('✅ Partner token found', 'success');
      setTestResults(prev => ({ ...prev, auth: 'pass' }));
    } else {
      addLog('❌ No partner token found', 'error');
      setTestResults(prev => ({ ...prev, auth: 'fail' }));
    }

    if (partnerData) {
      try {
        const parsed = JSON.parse(partnerData);
        addLog(`✅ Partner data found: ${parsed.name}`, 'success');
      } catch (e) {
        addLog('⚠️ Partner data corrupted', 'warning');
      }
    }

    // Test 2: API Connectivity
    addLog('2️⃣ Testing API Connectivity...', 'info');
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        addLog('✅ Backend server is reachable', 'success');
        setTestResults(prev => ({ ...prev, connectivity: 'pass' }));
      } else {
        addLog(`❌ Backend server error: ${response.status}`, 'error');
        setTestResults(prev => ({ ...prev, connectivity: 'fail' }));
      }
    } catch (error) {
      addLog(`❌ Cannot connect to backend: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, connectivity: 'fail' }));
    }

    // Test 3: Partner Profile API
    if (token) {
      addLog('3️⃣ Testing Partner Profile API...', 'info');
      try {
        const profileResponse = await partnerService.getProfile();
        if (profileResponse.success) {
          addLog(`✅ Profile API working: ${profileResponse.partner.name}`, 'success');
          setTestResults(prev => ({ ...prev, profile: 'pass' }));
        } else {
          addLog('❌ Profile API failed', 'error');
          setTestResults(prev => ({ ...prev, profile: 'fail' }));
        }
      } catch (error) {
        addLog(`❌ Profile API error: ${error.message}`, 'error');
        setTestResults(prev => ({ ...prev, profile: 'fail' }));
      }
    }

    // Test 4: Deliveries API
    if (token) {
      addLog('4️⃣ Testing Deliveries API...', 'info');
      try {
        const deliveriesResponse = await partnerService.getDeliveries();
        if (deliveriesResponse.success) {
          addLog(`✅ Deliveries API working: ${deliveriesResponse.deliveries.length} deliveries found`, 'success');
          setTestResults(prev => ({ ...prev, deliveries: 'pass' }));
          
          // Log delivery details
          deliveriesResponse.deliveries.forEach((delivery, index) => {
            addLog(`📦 Delivery ${index + 1}: ${delivery.trackingId} - ${delivery.status}`, 'info');
          });
        } else {
          addLog('❌ Deliveries API failed', 'error');
          setTestResults(prev => ({ ...prev, deliveries: 'fail' }));
        }
      } catch (error) {
        addLog(`❌ Deliveries API error: ${error.message}`, 'error');
        setTestResults(prev => ({ ...prev, deliveries: 'fail' }));
      }
    }

    // Test 5: Dashboard API
    if (token) {
      addLog('5️⃣ Testing Dashboard API...', 'info');
      try {
        const dashboardResponse = await partnerService.getDashboard();
        if (dashboardResponse.success) {
          addLog(`✅ Dashboard API working: ${dashboardResponse.activeDeliveries.length} active deliveries`, 'success');
          setTestResults(prev => ({ ...prev, dashboard: 'pass' }));
        } else {
          addLog('❌ Dashboard API failed', 'error');
          setTestResults(prev => ({ ...prev, dashboard: 'fail' }));
        }
      } catch (error) {
        addLog(`❌ Dashboard API error: ${error.message}`, 'error');
        setTestResults(prev => ({ ...prev, dashboard: 'fail' }));
      }
    }

    // Test 6: Browser Environment
    addLog('6️⃣ Testing Browser Environment...', 'info');
    addLog(`📱 User Agent: ${navigator.userAgent}`, 'info');
    addLog(`🌐 Online Status: ${navigator.onLine ? 'Online' : 'Offline'}`, navigator.onLine ? 'success' : 'error');
    addLog(`💾 LocalStorage Available: ${typeof Storage !== 'undefined' ? 'Yes' : 'No'}`, 'info');
    addLog(`🍪 Cookies Enabled: ${navigator.cookieEnabled ? 'Yes' : 'No'}`, 'info');

    addLog('✅ All tests completed!', 'success');
    setLoading(false);
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    addLog('🗑️ All browser storage cleared', 'warning');
    setTimeout(() => {
      window.location.href = '/partner';
    }, 1000);
  };

  const getTestIcon = (result) => {
    if (result === 'pass') return '✅';
    if (result === 'fail') return '❌';
    return '⏳';
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="text-yellow-400">Partner</span> Diagnostic Test
              </h1>
              <p className="text-slate-300">
                Run comprehensive tests to diagnose delivery visibility issues
              </p>
            </div>
            <button
              onClick={() => router.push('/partner/dashboard')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Test Controls</h2>
            <div className="flex space-x-4">
              <button
                onClick={runTests}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-800 px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
              </button>
              <button
                onClick={clearStorage}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🗑️ Clear Storage
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTestIcon(testResults.auth)}</span>
                  <span className="text-white font-medium">Authentication</span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTestIcon(testResults.connectivity)}</span>
                  <span className="text-white font-medium">Connectivity</span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTestIcon(testResults.deliveries)}</span>
                  <span className="text-white font-medium">Deliveries API</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Logs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Logs</h2>
          <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Click "Run All Tests" to start diagnostics
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-slate-400 font-mono">{log.timestamp}</span>
                    <span>{getLogIcon(log.type)}</span>
                    <span className={`${
                      log.type === 'error' ? 'text-red-300' :
                      log.type === 'success' ? 'text-green-300' :
                      log.type === 'warning' ? 'text-yellow-300' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Fixes */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Fixes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">🔄 If deliveries not showing:</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Check if you're logged in correctly</li>
                <li>• Verify your online status</li>
                <li>• Try manual refresh</li>
                <li>• Clear browser cache</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">🌐 If connection issues:</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Check internet connection</li>
                <li>• Verify backend server is running</li>
                <li>• Try different browser</li>
                <li>• Disable browser extensions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}