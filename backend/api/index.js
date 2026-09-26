import dotenv from 'dotenv';
dotenv.config();

import app from '../app.js';
import connectDB from '../config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB serverless connection error:', err.message);
  }
  return app(req, res);
}