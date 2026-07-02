const {
  SERVICE_NAME,
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
} = require('../config/metrics');

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.baseUrl || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
      service: SERVICE_NAME,
    };

    httpRequestDuration.observe(labels, durationSec);
    httpRequestsTotal.inc(labels);
    if (res.statusCode >= 500) httpErrorsTotal.inc(labels);
  });

  next();
}

module.exports = metricsMiddleware;
