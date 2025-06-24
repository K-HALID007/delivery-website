import express from 'express';
import {
    testGeminiConnection,
    generateChatResponse,
    analyzeDeliveryIssue,
    generateEmailResponse,
    generateStatusUpdate,
    generateText
} from '../controllers/gemini.controller.js';

const router = express.Router();

// Test Gemini API connection
router.get('/test', testGeminiConnection);

// Generate chat response for customer support
router.post('/chat', generateChatResponse);

// Analyze delivery issues
router.post('/analyze-delivery', analyzeDeliveryIssue);

// Generate email responses
router.post('/generate-email', generateEmailResponse);

// Generate status updates
router.post('/status-update', generateStatusUpdate);

// General text generation
router.post('/generate-text', generateText);

export default router;