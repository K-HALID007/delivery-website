"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

export default function AdminTest() {
  const [authStatus, setAuthStatus] = useState('checking');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('Testing admin authentication...');
      
      // Check if user is authenticated
      const isAuth = authService.isAuthenticated();
      const isAdmin = authService.isAdmin();
      const currentUser = authService.getCurrentUser();
      
      console.log('Auth check results:', { isAuth, isAdmin, currentUser });
      
      setUserInfo({
        isAuthenticated: isAuth,
        isAdmin: isAdmin,
        user: currentUser,
        token: sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token')
      });
      
      if (isAuth && isAdmin) {
        setAuthStatus('success');
      } else if (isAuth && !isAdmin) {
        setAuthStatus('not_admin');
      } else {
        setAuthStatus('not_authenticated');
      }
    } catch (err) {
      console.error('Auth test error:', err);
      setError(err.message);
      setAuthStatus('error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Admin Authentication Test</h1>
        
        {/* Auth Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className={`p-4 rounded-lg ${
            authStatus === 'success' ? 'bg-green-100 text-green-800' :
            authStatus === 'not_admin' ? 'bg-yellow-100 text-yellow-800' :
            authStatus === 'not_authenticated' ? 'bg-red-100 text-red-800' :
            authStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {authStatus === 'checking' && 'Checking authentication...'}
            {authStatus === 'success' && '✅ Successfully authenticated as admin'}
            {authStatus === 'not_admin' && '⚠️ Authenticated but not as admin'}
            {authStatus === 'not_authenticated' && '❌ Not authenticated'}
            {authStatus === 'error' && `❌ Error: ${error}`}
          </div>
        </div>

        {/* User Info */}
        {userInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2">
              <div><strong>Is Authenticated:</strong> {userInfo.isAuthenticated ? 'Yes' : 'No'}</div>
              <div><strong>Is Admin:</strong> {userInfo.isAdmin ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {userInfo.user ? JSON.stringify(userInfo.user, null, 2) : 'None'}</div>
              <div><strong>Token:</strong> {userInfo.token ? `${userInfo.token.substring(0, 20)}...` : 'None'}</div>
            </div>
          </div>
        )}

        {/* Session Storage Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Storage</h2>
          <div className="space-y-2">
            <div><strong>admin_token:</strong> {sessionStorage.getItem('admin_token') ? 'Present' : 'Not found'}</div>
            <div><strong>admin_user:</strong> {sessionStorage.getItem('admin_user') ? 'Present' : 'Not found'}</div>
            <div><strong>user_token:</strong> {sessionStorage.getItem('user_token') ? 'Present' : 'Not found'}</div>
            <div><strong>user_user:</strong> {sessionStorage.getItem('user_user') ? 'Present' : 'Not found'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                authService.logout();
                window.location.href = '/';
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}