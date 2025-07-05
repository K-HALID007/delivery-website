// Create admin via API endpoint
async function createAdminViaAPI() {
  try {
    const adminData = {
      name: 'API Admin',
      email: 'apiadmin@gmail.com',
      password: 'admin123'
    };

    console.log('🚀 Creating admin via API...');
    console.log('Admin data:', adminData);

    const response = await fetch('https://delivery-backend100.vercel.app/api/auth/admin/first', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin created successfully via API!');
      console.log('Response:', result);
      console.log('\n📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
    } else {
      console.log('❌ Failed to create admin:', result.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the function
createAdminViaAPI();