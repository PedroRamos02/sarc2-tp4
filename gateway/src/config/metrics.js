const client = require('prom-client');

const SERVICE_NAME = 'api-gateway';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'api_gateway_' });
register.setDefaultLabels({ service: SERVICE_NAME });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total de respostas HTTP de erro (status >= 500)',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

const proxyErrorsTotal = new client.Counter({
  name: 'gateway_proxy_errors_total',
  help: 'Total de falhas ao repassar requisições para os serviços de destino',
  labelNames: ['target'],
});

const authFailuresTotal = new client.Counter({
  name: 'gateway_auth_failures_total',
  help: 'Total de tokens JWT rejeitados (ausentes, inválidos ou expirados)',
  labelNames: ['reason'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);
register.registerMetric(proxyErrorsTotal);
register.registerMetric(authFailuresTotal);

module.exports = {
  SERVICE_NAME,
  register,
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
  proxyErrorsTotal,
  authFailuresTotal,
};
