// Test script to check user registration
import fetch from 'node-fetch';

const testRegistration = async () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    phone: "1234567890",
    address: "123 Test Street",
    city: "Test City",
    state: "Test State",
    postalCode: "12345",
    country: "Test Country"
  };

  try {
    console.log('Testing user registration...');
    console.log('Sending data:', JSON.stringify(testUser, null, 2));

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User data saved:', data.user);
      
      // Check if address is properly saved
      if (data.user.address) {
        console.log('✅ Address saved correctly:');
        console.log('  Street:', data.user.address.street);
        console.log('  City:', data.user.address.city);
        console.log('  State:', data.user.address.state);
        console.log('  Postal Code:', data.user.address.postalCode);
        console.log('  Country:', data.user.address.country);
      } else {
        console.log('❌ Address not saved properly');
      }
    } else {
      console.log('❌ Registration failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing registration:', error.message);
  }
};

testRegistration();