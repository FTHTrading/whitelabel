// ==========================================================================
// MIDDLEWARE: RATE LIMITER FOR EXPORT ENDPOINTS
// ==========================================================================

const requestCounts = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'local';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30;

  const current = requestCounts.get(ip) || { count: 0, startTime: now };

  if (now - current.startTime > windowMs) {
    current.count = 1;
    current.startTime = now;
  } else {
    current.count++;
  }

  requestCounts.set(ip, current);

  if (current.count > maxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests: Rate limit exceeded for export endpoints.'
    });
  }

  next();
}

module.exports = { rateLimit };
