import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log('Max retries reached');
        return new Error('Max retries reached');
      }
      return retries * 50;
    },
  },
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('✓ Redis connected'));

export async function initializeRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('✗ Redis connection failed:', err);
    process.exit(1);
  }
}
