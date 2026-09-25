const rateLimit = require('express-rate-limit');

// Rate limiter for AI multi-agent queries to prevent denial-of-service
const aiQueryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // allow up to 60 queries/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many queries from this client IP. Please wait a moment before sending another query.',
    disclaimer: 'ORCA Query Rate Protection'
  }
});

module.exports = {
  aiQueryLimiter
};
