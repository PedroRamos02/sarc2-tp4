const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });
});
