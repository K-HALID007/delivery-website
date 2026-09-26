import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = null;
        this.model = null;
    }

    getModel() {
        const key = process.env.GEMINI_API_KEY || this.apiKey;
        if (!key) {
            return null;
        }
        if (!this.model) {
            try {
                this.genAI = new GoogleGenerativeAI(key);
                this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            } catch (err) {
                console.warn('⚠️ Gemini AI initialization error:', err.message);
                return null;
            }
        }
        return this.model;
    }

    async testConnection() {
        try {
            const model = this.getModel();
            if (!model) return false;
            const result = await model.generateContent("ping");
            const response = await result.response;
            return !!response.text();
        } catch (error) {
            console.warn('⚠️ Gemini test connection failed:', error.message);
            return false;
        }
    }

    /**
     * Generate text using Gemini AI
     */
    async generateText(prompt, options = {}) {
        try {
            const model = this.getModel();
            if (!model) {
                return "Gemini AI is not configured on this server. Please set GEMINI_API_KEY in backend/.env.";
            }
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating text with Gemini:', error.message);
            return "I apologize, but I am currently unable to process your request. Please try again shortly.";
        }
    }

    /**
     * Generate chat response for customer support
     */
    async generateChatResponse(userMessage, context = {}) {
        try {
            const model = this.getModel();
            if (!model) {
                return "Hello! I am your automated assistant. Our AI services are currently operating in offline mode. Please feel free to track your shipment using your Tracking ID or submit a complaint form.";
            }

            const systemPrompt = `You are a helpful customer support assistant for a courier tracking service called Prime Dispatcher. 
            You help customers with delivery inquiries, order tracking, and general support questions.
            Be polite, professional, and provide concise, accurate information based on the context provided.
            
            Context: ${JSON.stringify(context)}
            
            User Message: ${userMessage}
            
            Please provide a helpful response:`;

            return await this.generateText(systemPrompt);
        } catch (error) {
            console.error('Error generating chat response:', error);
            return "I am having trouble processing that right now. Please check your tracking number or reach out to human support.";
        }
    }

    /**
     * Analyze delivery issues and suggest solutions
     */
    async analyzeDeliveryIssue(deliveryData) {
        try {
            const prompt = `Analyze this delivery issue and provide recommendations:
            ${JSON.stringify(deliveryData, null, 2)}
            
            Provide:
            1. Root cause analysis
            2. Recommended next steps
            3. Customer communication message`;

            return await this.generateText(prompt);
        } catch (error) {
            console.error('Error analyzing delivery issue:', error);
            return "Unable to analyze delivery issue at this time.";
        }
    }

    /**
     * Generate response for email inquiries
     */
    async generateEmailResponse(customerEmail, inquiryType) {
        try {
            const prompt = `Write a professional email response for:
            Type: ${inquiryType}
            Customer: ${customerEmail}
            
            Include greeting, answer, and professional sign-off.`;

            return await this.generateText(prompt);
        } catch (error) {
            console.error('Error generating email response:', error);
            return "Thank you for contacting us. We have received your inquiry and will respond shortly.";
        }
    }

    /**
     * Generate status update messages
     */
    async generateStatusUpdate(trackingNumber, currentStatus, location) {
        try {
            const prompt = `Write a clear status update SMS/message:
            Tracking: ${trackingNumber}
            Status: ${currentStatus}
            Location: ${location}`;

            return await this.generateText(prompt);
        } catch (error) {
            console.error('Error generating status update:', error);
            return `Shipment ${trackingNumber} update: Status is ${currentStatus} at ${location}.`;
        }
    }
}

export default new GeminiService();