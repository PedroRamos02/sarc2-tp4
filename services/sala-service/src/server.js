const app = require('./app');
const logger = require('./config/logger');
const espacoService = require('./services/espacoService');

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });
  espacoService.refreshEspacosGauge().catch((err) => {
    logger.error('failed_to_refresh_gauge', { message: err.message });
  });
});
