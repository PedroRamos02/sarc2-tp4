const app = require('./app');
const logger = require('./config/logger');
const equipamentoService = require('./services/equipamentoService');

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });
  equipamentoService.refreshEquipamentosGauge().catch((err) => {
    logger.error('failed_to_refresh_gauge', { message: err.message });
  });
});
