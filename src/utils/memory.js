// src/utils/memory.js
import Redis from 'ioredis';
import { config } from '../config.js';

// Initialize the Redis client
// We add a check to ensure we don't crash if the URL is missing during build
const redis = config.redis.url ? new Redis(config.redis.url) : null;

export const Memory = {
  // Save today's quiz and answers
  async saveDailyState(dateStr, data) {
    if (!redis) throw new Error("REDIS_URL is not defined");

    const key = `daily_tech:${dateStr}`;
    
    // Convert object to string for storage
    const value = JSON.stringify(data);
    
    // 'EX', 172800 sets expiration to 48 hours (in seconds)
    await redis.set(key, value, 'EX', 172800);
    console.log(`💾 Saved state for ${dateStr}`);
  },

  // Retrieve data
  async getDailyState(dateStr) {
    if (!redis) throw new Error("REDIS_URL is not defined");

    const key = `daily_tech:${dateStr}`;
    const rawData = await redis.get(key);
    
    // Convert string back to object
    return rawData ? JSON.parse(rawData) : null;
  },
  
  // Update state (e.g., mark quiz as sent)
  async updateState(dateStr, newData) {
    const current = await this.getDailyState(dateStr) || {};
    await this.saveDailyState(dateStr, { ...current, ...newData });
  }
};