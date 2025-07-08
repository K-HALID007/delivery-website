"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

export default function AdminDebug() {
  const [debugInfo, setDebugInfo] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('🔍 Admin Debug: Starting...');
      
      const info = {
        // Basic checks
        windowExists: typeof window !== 'undefined',
        sessionStorageExists: typeof sessionStorage !== 'undefined',
        
        // Session storage contents
        adminToken: sessionStorage.getItem('admin_token'),
        userToken: sessionStorage.getItem('user_token'),
        adminUser: sessionStorage.getItem('admin_user'),
        userUser: sessionStorage.getItem('user_user'),
        
        // Auth service checks
        isAuthenticated: null,
        isAdmin: null,
        currentUser: null,
        
        // Environment
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      };

      // Try auth service methods
      try {
        info.isAuthenticated = authService.isAuthenticated();
        console.log('✅ isAuthenticated:', info.isAuthenticated);
      } catch (e) {
        info.isAuthenticatedError = e.message;
        console.error('❌ isAuthenticated error:', e);
      }

      try {
        info.isAdmin = authService.isAdmin();
        console.log('✅ isAdmin:', info.isAdmin);
      } catch (e) {
        info.isAdminError = e.message;
        console.error('❌ isAdmin error:', e);
      }

      try {
        info.currentUser = authService.getCurrentUser();
        console.log('✅ currentUser:', info.currentUser);
      } catch (e) {
        info.currentUserError = e.message;
        console.error('❌ currentUser error:', e);
      }

      setDebugInfo(info);
      console.log('🔍 Debug info collected:', info);
      
    } catch (err) {
      console.error('🔍 Debug page error:', err);
      setError(err.message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Admin Debug Information</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Debug Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Environment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Environment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Window exists:</strong> {debugInfo.windowExists ? '✅ Yes' : '❌ No'}</div>
              <div><strong>SessionStorage exists:</strong> {debugInfo.sessionStorageExists ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Node ENV:</strong> {debugInfo.nodeEnv || 'Not set'}</div>
              <div><strong>API URL:</strong> {debugInfo.apiUrl || 'Not set'}</div>
            </div>
          </div>

          {/* Session Storage */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Session Storage</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Admin Token:</strong> {debugInfo.adminToken ? `${debugInfo.adminToken.substring(0, 20)}...` : '❌ Not found'}</div>
              <div><strong>User Token:</strong> {debugInfo.userToken ? `${debugInfo.userToken.substring(0, 20)}...` : '❌ Not found'}</div>
              <div><strong>Admin User:</strong> {debugInfo.adminUser ? '✅ Present' : '❌ Not found'}</div>
              <div><strong>User User:</strong> {debugInfo.userUser ? '✅ Present' : '❌ Not found'}</div>
            </div>
          </div>

          {/* Auth Service Results */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Auth Service Results</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Is Authenticated:</strong> 
                {debugInfo.isAuthenticated !== null ? 
                  (debugInfo.isAuthenticated ? '✅ Yes' : '❌ No') : 
                  '⏳ Checking...'
                }
                {debugInfo.isAuthenticatedError && <span className="text-red-600 ml-2">Error: {debugInfo.isAuthenticatedError}</span>}
              </div>
              
              <div><strong>Is Admin:</strong> 
                {debugInfo.isAdmin !== null ? 
                  (debugInfo.isAdmin ? '✅ Yes' : '❌ No') : 
                  '⏳ Checking...'
                }
                {debugInfo.isAdminError && <span className="text-red-600 ml-2">Error: {debugInfo.isAdminError}</span>}
              </div>
              
              <div><strong>Current User:</strong> 
                {debugInfo.currentUser ? 
                  `✅ ${debugInfo.currentUser.name} (${debugInfo.currentUser.email}) - Role: ${debugInfo.currentUser.role}` : 
                  '❌ No user'
                }
                {debugInfo.currentUserError && <span className="text-red-600 ml-2">Error: {debugInfo.currentUserError}</span>}
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Raw Debug Data</h2>
            <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Session & Go Home
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Try Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/admin/simple'}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Simple Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}