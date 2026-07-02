const app = require('./app');
const logger = require('./config/logger');
const usuarioService = require('./services/usuarioService');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });
  usuarioService.refreshUsuariosGauge().catch((err) => {
    logger.error('failed_to_refresh_gauge', { message: err.message });
  });
});
