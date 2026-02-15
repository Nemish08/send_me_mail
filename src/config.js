import 'dotenv/config';

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  email: {
    user: process.env.EMAIL_SEN, // Your Gmail
    pass: process.env.EMAIL_PASS, // App Password
    recipient: process.env.EMAIL_REC // Where to send
  },
  kv: {
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  }
};