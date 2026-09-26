import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start HTTP server
async function startServer() {
  try {
    console.log('🚀 Initializing Prime Dispatcher Backend...');
    
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`\n=============================================`);
      console.log(`✅ Server successfully running on port ${PORT}`);
      console.log(`🔗 Local URL:   http://localhost:${PORT}`);
      console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`=============================================\n`);
    });

    // Graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('💤 HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
