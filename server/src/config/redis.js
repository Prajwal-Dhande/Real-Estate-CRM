const Redis = require('ioredis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

let redis = null;
let isRedisConnected = false;

try {
  redis = new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
    lazyConnect: true
  });

  redis.on('connect', () => {
    isRedisConnected = true;
    console.log(`[Redis] Connected to ${redisHost}:${redisPort}`);
  });

  redis.on('error', (err) => {
    isRedisConnected = false;
    // Log as warning rather than crashing if Redis is temporarily unavailable
    console.warn(`[Redis] Warning: ${err.message}`);
  });

  redis.connect().catch((err) => {
    console.warn(`[Redis] Initial connection warning: ${err.message}`);
  });
} catch (err) {
  console.warn(`[Redis] Failed to initialize client: ${err.message}`);
}

module.exports = {
  redis,
  isReady: () => isRedisConnected && redis.status === 'ready',
  redisConfig: {
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null
  }
};

