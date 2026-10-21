const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many attempts, please try again later" });
  },
});

authLimiter.authLimiter = authLimiter;

module.exports = authLimiter;
