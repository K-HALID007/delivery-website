// Quick fix for partner active status
const API_URL = 'https://delivery-backend100.vercel.app/api';

async function fixPartnerIssue() {
  console.log('🔧 Starting partner fix...');
  
  try {
    // 1. Check specific partner status
    console.log('📋 Checking Atharva Bhintade status...');
    const checkResponse = await fetch(`${API_URL}/fix/check-partner-status/atharvbhintade1@gmail.com`);
    const checkData = await checkResponse.json();
    
    console.log('Partner Status:', checkData);
    
    // 2. Fix all approved partners
    console.log('🔧 Fixing all approved partners...');
    const fixResponse = await fetch(`${API_URL}/fix/fix-partner-active-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const fixData = await fixResponse.json();
    console.log('Fix Result:', fixData);
    
    // 3. Check partner status again
    console.log('📋 Checking Atharva Bhintade status after fix...');
    const checkAfterResponse = await fetch(`${API_URL}/fix/check-partner-status/atharvbhintade1@gmail.com`);
    const checkAfterData = await checkAfterResponse.json();
    
    console.log('Partner Status After Fix:', checkAfterData);
    
    if (checkAfterData.success && checkAfterData.partner.canLogin) {
      console.log('✅ SUCCESS! Partner can now login to dashboard');
    } else {
      console.log('❌ Issue still exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  fixPartnerIssue();
} else {
  // Node.js environment
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    fixPartnerIssue();
  });
}