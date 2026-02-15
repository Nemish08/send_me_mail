import { createClient } from '@vercel/kv';
import { config } from '../config.js';

const kv = createClient({
  url: config.kv.url,
  token: config.kv.token,
});

export const Memory = {
  // Save today's quiz and answers
  async saveDailyState(dateStr, data) {
    // Expires in 48 hours to keep DB clean
    await kv.set(`daily_tech:${dateStr}`, data, { ex: 172800 });
  },

  // Retrieve data
  async getDailyState(dateStr) {
    return await kv.get(`daily_tech:${dateStr}`);
  },
  
  // Update state (e.g., mark quiz as sent)
  async updateState(dateStr, newData) {
    const current = await this.getDailyState(dateStr) || {};
    await this.saveDailyState(dateStr, { ...current, ...newData });
  }
};