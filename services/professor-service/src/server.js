const app = require('./app');
const logger = require('./config/logger');
const professorService = require('./services/professorService');
const cursoService = require('./services/cursoService');
const disciplinaService = require('./services/disciplinaService');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });

  Promise.all([
    professorService.refreshProfessoresGauge(),
    cursoService.refreshCursosGauge(),
    disciplinaService.refreshDisciplinasGauge(),
  ]).catch((err) => {
    logger.error('failed_to_refresh_gauge', { message: err.message });
  });
});
