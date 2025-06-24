// Frontend Debug Script for Partner Delivery Issues
// Run this in the browser console on the partner deliveries page

console.log('🔍 PARTNER FRONTEND DEBUG SCRIPT STARTED');
console.log('==========================================');

// 1. Check localStorage and authentication
console.log('\n1. 🔐 AUTHENTICATION CHECK:');
const partnerToken = localStorage.getItem('partnerToken');
const partnerData = localStorage.getItem('partnerData');

console.log('Partner Token:', partnerToken ? `${partnerToken.substring(0, 50)}...` : 'NOT FOUND');
console.log('Partner Data:', partnerData ? JSON.parse(partnerData) : 'NOT FOUND');

if (!partnerToken) {
  console.error('❌ NO PARTNER TOKEN FOUND - Partner needs to login again');
}

// 2. Check API configuration
console.log('\n2. 🌐 API CONFIGURATION:');
const apiUrl = 'http://localhost:5000/api';
console.log('API URL:', apiUrl);

// 3. Test API connectivity
console.log('\n3. 🔗 API CONNECTIVITY TEST:');

async function testAPIConnectivity() {
  try {
    const response = await fetch(`${apiUrl}/partner/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response OK:', response.ok);
    
    const data = await response.json();
    console.log('API Response Data:', data);
    
    if (!response.ok) {
      console.error('❌ API ERROR:', data.message);
      if (response.status === 401) {
        console.error('❌ AUTHENTICATION FAILED - Token might be expired');
      }
    } else {
      console.log('✅ API connectivity working');
    }
  } catch (error) {
    console.error('❌ NETWORK ERROR:', error);
    console.error('❌ Cannot connect to backend server');
  }
}

// 4. Test deliveries API specifically
console.log('\n4. 📦 DELIVERIES API TEST:');

async function testDeliveriesAPI() {
  try {
    const response = await fetch(`${apiUrl}/partner/deliveries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      }
    });
    
    console.log('Deliveries API Status:', response.status);
    console.log('Deliveries API OK:', response.ok);
    
    const data = await response.json();
    console.log('Deliveries API Response:', data);
    
    if (data.success) {
      console.log(`✅ Found ${data.deliveries.length} deliveries`);
      console.log('📋 Deliveries:', data.deliveries.map(d => ({
        trackingId: d.trackingId,
        status: d.status,
        createdAt: d.createdAt,
        assignedAt: d.assignedAt
      })));
    } else {
      console.error('❌ Deliveries API failed:', data.message);
    }
  } catch (error) {
    console.error('❌ DELIVERIES API ERROR:', error);
  }
}

// 5. Check browser cache and storage
console.log('\n5. 💾 BROWSER STORAGE CHECK:');
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('SessionStorage keys:', Object.keys(sessionStorage));

// Check for any cached data that might be interfering
const allLocalStorageData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allLocalStorageData[key] = localStorage.getItem(key);
}
console.log('All localStorage data:', allLocalStorageData);

// 6. Check network tab for failed requests
console.log('\n6. 🌐 NETWORK MONITORING:');
console.log('Open DevTools > Network tab and look for:');
console.log('- Failed API requests (red status codes)');
console.log('- CORS errors');
console.log('- Timeout errors');
console.log('- 401/403 authentication errors');

// 7. Check console for JavaScript errors
console.log('\n7. 🐛 JAVASCRIPT ERROR CHECK:');
console.log('Look for any JavaScript errors in the console that might prevent API calls');

// 8. Test with different filters
console.log('\n8. 🔍 FILTER TEST:');

async function testWithFilters() {
  const filters = ['', 'assigned', 'picked_up', 'delivered'];
  
  for (const filter of filters) {
    try {
      const queryString = filter ? `?status=${filter}` : '';
      const response = await fetch(`${apiUrl}/partner/deliveries${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${partnerToken}`
        }
      });
      
      const data = await response.json();
      console.log(`Filter "${filter || 'all'}":`, data.success ? `${data.deliveries.length} deliveries` : 'FAILED');
    } catch (error) {
      console.error(`Filter "${filter}" error:`, error);
    }
  }
}

// 9. Check React component state
console.log('\n9. ⚛️ REACT COMPONENT STATE:');
console.log('Check React DevTools for component state:');
console.log('- deliveries array');
console.log('- loading state');
console.log('- error state');
console.log('- filters object');

// 10. Manual refresh test
console.log('\n10. 🔄 MANUAL REFRESH TEST:');
console.log('Try these manual actions:');
console.log('1. Hard refresh (Ctrl+F5)');
console.log('2. Clear browser cache');
console.log('3. Open in incognito/private mode');
console.log('4. Try different browser');

// Run the tests
if (partnerToken) {
  console.log('\n🚀 RUNNING API TESTS...');
  testAPIConnectivity();
  setTimeout(() => testDeliveriesAPI(), 1000);
  setTimeout(() => testWithFilters(), 2000);
} else {
  console.error('❌ Cannot run API tests - no partner token found');
}

// 11. Provide debugging commands
console.log('\n11. 🛠️ DEBUGGING COMMANDS:');
console.log('Run these in console:');
console.log('- localStorage.clear() // Clear all storage');
console.log('- location.reload() // Hard refresh');
console.log('- fetch("http://localhost:5000/api/partner/deliveries", {headers: {"Authorization": "Bearer " + localStorage.getItem("partnerToken")}}).then(r => r.json()).then(console.log) // Direct API test');

console.log('\n✅ DEBUG SCRIPT COMPLETED');
console.log('Check the output above for any issues');