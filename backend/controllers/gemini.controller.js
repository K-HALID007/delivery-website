import geminiService from '../services/gemini.service.js';

/**
 * Test Gemini API connection
 */
export const testGeminiConnection = async (req, res) => {
    try {
        const isConnected = await geminiService.testConnection();
        
        if (isConnected) {
            res.json({
                success: true,
                message: 'Gemini API connection successful',
                status: 'connected'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Gemini API connection failed',
                status: 'disconnected'
            });
        }
    } catch (error) {
        console.error('Error testing Gemini connection:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing Gemini API connection',
            error: error.message
        });
    }
};

/**
 * Generate chat response for customer support
 */
export const generateChatResponse = async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const response = await geminiService.generateChatResponse(message, context);

        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating chat response:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating chat response',
            error: error.message
        });
    }
};

/**
 * Analyze delivery issues
 */
export const analyzeDeliveryIssue = async (req, res) => {
    try {
        const { deliveryData } = req.body;

        if (!deliveryData) {
            return res.status(400).json({
                success: false,
                message: 'Delivery data is required'
            });
        }

        const analysis = await geminiService.analyzeDeliveryIssue(deliveryData);

        res.json({
            success: true,
            analysis: analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error analyzing delivery issue:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing delivery issue',
            error: error.message
        });
    }
};

/**
 * Generate email responses
 */
export const generateEmailResponse = async (req, res) => {
    try {
        const { emailType, data } = req.body;

        if (!emailType) {
            return res.status(400).json({
                success: false,
                message: 'Email type is required'
            });
        }

        const emailContent = await geminiService.generateEmailResponse(emailType, data);

        res.json({
            success: true,
            emailContent: emailContent,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating email response:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating email response',
            error: error.message
        });
    }
};

/**
 * Generate status updates
 */
export const generateStatusUpdate = async (req, res) => {
    try {
        const { deliveryStatus } = req.body;

        if (!deliveryStatus) {
            return res.status(400).json({
                success: false,
                message: 'Delivery status is required'
            });
        }

        const statusUpdate = await geminiService.generateStatusUpdate(deliveryStatus);

        res.json({
            success: true,
            statusUpdate: statusUpdate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating status update:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating status update',
            error: error.message
        });
    }
};

/**
 * General text generation
 */
export const generateText = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        const generatedText = await geminiService.generateText(prompt);

        res.json({
            success: true,
            generatedText: generatedText,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating text',
            error: error.message
        });
    }
};