require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { register } = require('./config/metrics');
const requestLogger = require('./middlewares/requestLogger');
const metricsMiddleware = require('./middlewares/metricsMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const professorRoutes = require('./routes/professorRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const disciplinaRoutes = require('./routes/disciplinaRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(requestLogger);
app.use(metricsMiddleware);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'professor-service' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/professores', professorRoutes);
app.use('/cursos', cursoRoutes);
app.use('/disciplinas', disciplinaRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
