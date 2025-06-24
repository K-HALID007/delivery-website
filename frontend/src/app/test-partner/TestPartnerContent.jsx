'use client';

import { useState } from 'react';
import partnerService from '../../services/partner.service.js';

export default function TestPartnerContent() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPartnerRegistration = async () => {
    setLoading(true);
    setResult('');

    try {
      const testData = {
        name: 'Test Partner',
        email: 'testpartner@example.com',
        password: 'password123',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        vehicleType: 'bike',
        vehicleNumber: 'MH12AB1234',
        licenseNumber: 'DL123456789',
        experience: '2'
      };

      const response = await partnerService.register(testData);
      setResult(`Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPartnerLogin = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await partnerService.login({
        email: 'testpartner@example.com',
        password: 'password123'
      });
      setResult(`Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAPIConnection = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('http://localhost:5000/api/partner/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'API Test Partner',
          email: 'apitest@example.com',
          password: 'password123',
          phone: '9876543210',
          address: '123 API Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          vehicleType: 'bike',
          vehicleNumber: 'MH12CD5678',
          licenseNumber: 'DL987654321',
          experience: '1'
        })
      });

      const data = await response.json();
      setResult(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Partner System Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={testAPIConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API Connection'}
            </button>
            <button
              onClick={testPartnerRegistration}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Partner Registration'}
            </button>
            <button
              onClick={testPartnerLogin}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Partner Login'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Partner Service Info:</h3>
          <p><strong>Base URL:</strong> {partnerService.baseURL}</p>
          <p><strong>Is Logged In:</strong> {partnerService.isLoggedIn() ? 'Yes' : 'No'}</p>
          <p><strong>Stored Partner:</strong> {JSON.stringify(partnerService.getStoredPartnerData())}</p>
        </div>
      </div>
    </div>
  );
}