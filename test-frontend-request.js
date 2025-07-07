// Test exact frontend request
const https = require('https');

function testFrontendRequest() {
    const data = JSON.stringify({
        email: 'admin@primedispatcher.com',
        password: 'admin123'
    });

    const options = {
        hostname: 'delivery-backend100.vercel.app',
        port: 443,
        path: '/api/auth/admin/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };

    console.log('🧪 Testing exact frontend request...');
    console.log('URL:', `https://${options.hostname}${options.path}`);
    console.log('Data:', data);

    const req = https.request(options, (res) => {
        let body = '';
        
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        
        res.on('data', (chunk) => {
            body += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonBody = JSON.parse(body);
                console.log('Response:', JSON.stringify(jsonBody, null, 2));
                
                if (res.statusCode === 200) {
                    console.log('✅ SUCCESS! Admin login working!');
                } else {
                    console.log('❌ FAILED! Status:', res.statusCode);
                }
            } catch (e) {
                console.log('Raw response:', body);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request error:', error);
    });

    req.write(data);
    req.end();
}

testFrontendRequest();