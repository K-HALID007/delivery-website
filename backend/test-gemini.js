import geminiService from './services/gemini.service.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set ✅' : 'Not Set ❌');
    
    try {
        // Test basic connection
        console.log('\n1. Testing basic connection...');
        const isConnected = await geminiService.testConnection();
        console.log('Connection Status:', isConnected ? 'Success ✅' : 'Failed ❌');
        
        // Test text generation
        console.log('\n2. Testing text generation...');
        const response = await geminiService.generateText('Hello! Please introduce yourself as a courier service AI assistant.');
        console.log('Generated Response:', response);
        
        // Test chat response
        console.log('\n3. Testing chat response...');
        const chatResponse = await geminiService.generateChatResponse(
            'Where is my package?', 
            { orderId: 'ORD123', status: 'in_transit', estimatedDelivery: '2024-01-15' }
        );
        console.log('Chat Response:', chatResponse);
        
        // Test delivery analysis
        console.log('\n4. Testing delivery analysis...');
        const analysis = await geminiService.analyzeDeliveryIssue({
            orderId: 'ORD456',
            status: 'delayed',
            originalDeliveryDate: '2024-01-10',
            currentDate: '2024-01-12',
            reason: 'Weather conditions'
        });
        console.log('Delivery Analysis:', analysis);
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testGeminiAPI();