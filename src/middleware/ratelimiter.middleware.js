const rateLimit = require('express-rate-limit');

const limitResponse = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    error: message,
    retryAfter: res.getHeader('Retry-After'),
  });
};

const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, 
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          limitResponse('Too many requests. Please slow down.'),
});


const authLimiter = rateLimit({
    windowMs:         15 * 60 * 1000,
    max:              10,
    standardHeaders:  true,
    legacyHeaders:    false,
    handler:          limitResponse('Too many login attempts. Please try again later.'),
});


const registrationLimiter = rateLimit({
    windowMs:         60 * 60 * 1000,
    max:              5,
    standardHeaders:  true,
    legacyHeaders:    false,
    handler:          limitResponse('Too many registration attempts. Please try again later.'),
});

module.exports = {
    globalLimiter,
    authLimiter,
    registrationLimiter
}