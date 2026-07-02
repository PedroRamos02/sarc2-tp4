const app = require('./app');
const logger = require('./config/logger');
const reservaService = require('./services/reservaService');

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });
  reservaService.refreshReservasGauge().catch((err) => {
    logger.error('failed_to_refresh_gauge', { message: err.message });
  });
});
