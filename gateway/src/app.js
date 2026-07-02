require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { register } = require('./config/metrics');
const requestLogger = require('./middlewares/requestLogger');
const metricsMiddleware = require('./middlewares/metricsMiddleware');
const authenticate = require('./middlewares/authenticate');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const buildProxyRoutes = require('./routes/buildProxyRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(requestLogger);
app.use(metricsMiddleware);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições, tente novamente em instantes' },
  }),
);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'api-gateway' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Verifica o JWT (se presente) e injeta req.identity ANTES do proxy, para que
// buildProxyRoutes possa anexar os headers x-user-* na requisição repassada.
// Não usa express.json() aqui de propósito: o body é repassado em stream puro
// pelo http-proxy-middleware, sem ser parseado/reserializado pelo gateway.
app.use(authenticate);

buildProxyRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
