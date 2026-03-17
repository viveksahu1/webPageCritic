const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: "Too many requests. Please try again later." },
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: "Too many analyze requests. Slow down." },
});

module.exports = { authLimiter, analyzeLimiter };
