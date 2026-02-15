// src/config.js
import 'dotenv/config';

export const config = {
  // Security
  cronSecret: process.env.CRON_SECRET, 
  
  // AI
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Email
  email: {
    user: process.env.EMAIL_SEN, 
    pass: process.env.EMAIL_PASS, 
    recipient: process.env.EMAIL_REC 
  },
  
  // Redis (Changed to use REDIS_URL)
  redis: {
    url: process.env.REDIS_URL // Ensure this is set in Vercel Env Vars
  }
};