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
      userId: req.identity ? req.identity.sub : null,
      role: req.identity ? req.identity.role : null,
    });
  });
  next();
}

module.exports = requestLogger;
