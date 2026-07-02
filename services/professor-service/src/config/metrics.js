const client = require('prom-client');

const SERVICE_NAME = 'professor-service';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'professor_service_' });
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

const professoresGauge = new client.Gauge({
  name: 'professor_professores_total',
  help: 'Total de professores ativos cadastrados',
});

const cursosGauge = new client.Gauge({
  name: 'professor_cursos_total',
  help: 'Total de cursos ativos cadastrados',
});

const disciplinasGauge = new client.Gauge({
  name: 'professor_disciplinas_total',
  help: 'Total de disciplinas ativas cadastradas',
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);
register.registerMetric(professoresGauge);
register.registerMetric(cursosGauge);
register.registerMetric(disciplinasGauge);

module.exports = {
  SERVICE_NAME,
  register,
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
  professoresGauge,
  cursosGauge,
  disciplinasGauge,
};
