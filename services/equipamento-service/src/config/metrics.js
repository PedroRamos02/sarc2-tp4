const client = require('prom-client');

const SERVICE_NAME = 'equipamento-service';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'equipamento_service_' });
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

const equipamentosGauge = new client.Gauge({
  name: 'equipamento_equipamentos_total',
  help: 'Total de equipamentos ativos cadastrados',
});

const unidadesGauge = new client.Gauge({
  name: 'equipamento_unidades_total',
  help: 'Soma da quantidade total de unidades de equipamentos ativos',
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);
register.registerMetric(equipamentosGauge);
register.registerMetric(unidadesGauge);

module.exports = {
  SERVICE_NAME,
  register,
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
  equipamentosGauge,
  unidadesGauge,
};
