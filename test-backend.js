// Simple Node.js script to test backend
const https = require('https');

function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Test Script'
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonBody
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testBackend() {
    console.log('🧪 Testing Backend...\n');

    // Test 1: Health Check
    try {
        console.log('1. Testing Health Endpoint...');
        const health = await makeRequest('https://delivery-backend100.vercel.app/api/health');
        console.log('✅ Health Status:', health.status);
        console.log('📄 Health Response:', JSON.stringify(health.data, null, 2));
    } catch (error) {
        console.log('❌ Health Check Failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: CORS Test
    try {
        console.log('2. Testing CORS Endpoint...');
        const cors = await makeRequest('https://delivery-backend100.vercel.app/api/cors-test');
        console.log('✅ CORS Status:', cors.status);
        console.log('📄 CORS Response:', JSON.stringify(cors.data, null, 2));
    } catch (error) {
        console.log('❌ CORS Test Failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Create First Admin
    try {
        console.log('3. Creating First Admin...');
        const adminData = {
            name: 'Admin User',
            email: 'admin@primedispatcher.com',
            password: 'admin123'
        };
        
        const createAdmin = await makeRequest(
            'https://delivery-backend100.vercel.app/api/auth/admin/first',
            'POST',
            adminData
        );
        console.log('✅ Create Admin Status:', createAdmin.status);
        console.log('📄 Create Admin Response:', JSON.stringify(createAdmin.data, null, 2));
        
        if (createAdmin.status === 201) {
            console.log('\n🎉 ADMIN CREATED SUCCESSFULLY!');
            console.log('📧 Email: admin@primedispatcher.com');
            console.log('🔑 Password: admin123');
        }
    } catch (error) {
        console.log('❌ Create Admin Failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Admin Login
    try {
        console.log('4. Testing Admin Login...');
        const loginData = {
            email: 'admin@primedispatcher.com',
            password: 'admin123'
        };
        
        const login = await makeRequest(
            'https://delivery-backend100.vercel.app/api/auth/admin/login',
            'POST',
            loginData
        );
        console.log('✅ Login Status:', login.status);
        console.log('📄 Login Response:', JSON.stringify(login.data, null, 2));
        
        if (login.status === 200) {
            console.log('\n🎉 ADMIN LOGIN SUCCESSFUL!');
            console.log('📧 Email: admin@primedispatcher.com');
            console.log('🔑 Password: admin123');
            console.log('🎫 Token Generated:', !!login.data.token);
        }
    } catch (error) {
        console.log('❌ Admin Login Failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🏁 Backend Test Complete!');
}

testBackend().catch(console.error);