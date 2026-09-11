const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (error) => {
  console.error('Redis error:', error.message);
});

redisClient.connectIfNeeded = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.warn('Redis unavailable; continuing without Redis.');
    }
  }
};

module.exports = redisClient;
