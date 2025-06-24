import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    /**
     * Generate text using Gemini AI
     * @param {string} prompt - The prompt to send to Gemini
     * @param {Object} options - Additional options for generation
     * @returns {Promise<string>} - Generated text response
     */
    async generateText(prompt, options = {}) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating text with Gemini:', error);
            throw new Error('Failed to generate text with Gemini AI');
        }
    }

    /**
     * Generate chat response for customer support
     * @param {string} userMessage - User's message
     * @param {Object} context - Additional context (order info, delivery status, etc.)
     * @returns {Promise<string>} - AI response
     */
    async generateChatResponse(userMessage, context = {}) {
        try {
            const systemPrompt = `You are a helpful customer support assistant for a courier tracking service. 
            You help customers with delivery inquiries, order tracking, and general support questions.
            Be polite, professional, and provide accurate information based on the context provided.
            
            Context: ${JSON.stringify(context)}
            
            User Message: ${userMessage}
            
            Please provide a helpful response:`;

            return await this.generateText(systemPrompt);
        } catch (error) {
            console.error('Error generating chat response:', error);
            throw new Error('Failed to generate chat response');
        }
    }

    /**
     * Analyze delivery issues and suggest solutions
     * @param {Object} deliveryData - Delivery information
     * @returns {Promise<string>} - Analysis and suggestions
     */
    async analyzeDeliveryIssue(deliveryData) {
        try {
            const prompt = `Analyze this delivery issue and provide suggestions for resolution:
            
            Delivery Data: ${JSON.stringify(deliveryData)}
            
            Please provide:
            1. Issue analysis
            2. Possible causes
            3. Recommended actions
            4. Customer communication suggestions`;

            return await this.generateText(prompt);
        } catch (error) {
            console.error('Error analyzing delivery issue:', error);
            throw new Error('Failed to analyze delivery issue');
        }
    }

    /**
     * Generate automated email responses
     * @param {string} emailType - Type of email (complaint, inquiry, update, etc.)
     * @param {Object} data - Relevant data for the email
     * @returns {Promise<string>} - Generated email content
     */
    async generateEmailResponse(emailType, data) {
        try {
            const prompt = `Generate a professional email response for a courier service:
            
            Email Type: ${emailType}
            Data: ${JSON.stringify(data)}
            
            Please create a professional, empathetic, and helpful email response that addresses the customer's needs.`;

            return await this.generateText(prompt);
        } catch (error) {
            console.error('Error generating email response:', error);
            throw new Error('Failed to generate email response');
        }
    }

    /**
     * Generate delivery status updates with natural language
     * @param {Object} deliveryStatus - Current delivery status
     * @returns {Promise<string>} - Human-friendly status update
     */
    async generateStatusUpdate(deliveryStatus) {
        try {
            const prompt = `Convert this delivery status into a friendly, informative message for the customer:
            
            Status Data: ${JSON.stringify(deliveryStatus)}
            
            Create a clear, reassuring message that explains the current status and what to expect next.`;

            return await this.generateText(prompt);
        } catch (error) {
            console.error('Error generating status update:', error);
            throw new Error('Failed to generate status update');
        }
    }

    /**
     * Test the Gemini API connection
     * @returns {Promise<boolean>} - True if connection is successful
     */
    async testConnection() {
        try {
            const result = await this.generateText("Hello, this is a test message. Please respond with 'Connection successful'.");
            return result.includes('Connection successful') || result.length > 0;
        } catch (error) {
            console.error('Gemini API connection test failed:', error);
            return false;
        }
    }
}

export default new GeminiService();