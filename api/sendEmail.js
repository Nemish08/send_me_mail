// api/sendEmail.js
import 'dotenv/config';
import { generateAndSend } from '../src/agent.js';

export default async function handler(req, res) {
  try {
    // You can accept a custom prompt via query param or body
    const prompt = req.method === "POST" && req.body?.prompt
      ? req.body.prompt
      : "Send me a mail of complete details 2020 all the important events that happened in India.";

    const result = await generateAndSend(prompt);
    res.status(200).json(result);
  } catch (err) {
    console.error("api/sendEmail error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
