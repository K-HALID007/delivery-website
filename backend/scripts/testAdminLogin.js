import fetch from 'node-fetch';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('Token received:', !!data.token);
      console.log('User role:', data.user?.role);
    } else {
      console.log('❌ Admin login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  }
}

testAdminLogin();