const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('http_request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
      userId: req.headers['x-user-id'] || null,
      role: req.headers['x-user-role'] || null,
    });
  });
  next();
}

module.exports = requestLogger;
