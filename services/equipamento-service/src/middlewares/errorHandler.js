const logger = require('../config/logger');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error('unhandled_error', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn('request_error', {
      message: err.publicMessage || err.message,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    error: err.publicMessage || 'Erro interno do servidor',
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
