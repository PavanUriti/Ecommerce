const { RateLimiterRedis } = require('rate-limiter-flexible');
const ClientError = require('../shared/client-error');

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const redisClient  = await require('./cache.init').init();

    const rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'rate_limiter',
      points: 10,
      duration: 60,
    });

    const ipAddress = req.ip;
    const rateLimitKey = `rate_limit:${ipAddress}`;

    const rateLimiterRes = await rateLimiter.consume(rateLimitKey);

    if (rateLimiterRes.remainingPoints >= 0) {
      res.set({
        'X-RateLimit-Limit': rateLimiterRes.limit,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(rateLimiterRes.msBeforeNext).toISOString(),
      });
      await redisClient.quit();
      return next();
    } else {
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: retryAfter,
      });
    }
  } catch (error) {
    console.error('Rate limiting error:', error);
    next( new ClientError(429, error));
  }
};

module.exports = { rateLimitMiddleware };
