const client = require('prom-client');

const SERVICE_NAME = 'reserva-service';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'reserva_service_' });
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

const reservasGauge = new client.Gauge({
  name: 'reserva_reservas_total',
  help: 'Total de reservas ativas cadastradas',
});

const reservasCriadasTotal = new client.Counter({
  name: 'reserva_criadas_total',
  help: 'Total de reservas criadas com sucesso',
});

const reservasConflitoTotal = new client.Counter({
  name: 'reserva_conflitos_total',
  help: 'Total de tentativas de reserva rejeitadas por conflito',
  labelNames: ['tipo'],
});

const reservasCanceladasTotal = new client.Counter({
  name: 'reserva_canceladas_total',
  help: 'Total de reservas canceladas',
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);
register.registerMetric(reservasGauge);
register.registerMetric(reservasCriadasTotal);
register.registerMetric(reservasConflitoTotal);
register.registerMetric(reservasCanceladasTotal);

module.exports = {
  SERVICE_NAME,
  register,
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
  reservasGauge,
  reservasCriadasTotal,
  reservasConflitoTotal,
  reservasCanceladasTotal,
};
