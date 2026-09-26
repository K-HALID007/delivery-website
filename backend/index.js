import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

// Initialize DB connection for serverless / entrypoint
connectDB().catch(err => {
  console.warn('⚠️ MongoDB initialization warning:', err.message);
});

export default app;