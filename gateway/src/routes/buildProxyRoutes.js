const { createProxyMiddleware } = require('http-proxy-middleware');
const proxyTargets = require('../config/proxyTargets');
const logger = require('../config/logger');
const { proxyErrorsTotal } = require('../config/metrics');

function injectIdentityHeaders(proxyReq, req) {
  if (req.identity) {
    proxyReq.setHeader('x-user-id', String(req.identity.sub));
    proxyReq.setHeader('x-user-role', req.identity.role);
    if (req.identity.professorId) {
      proxyReq.setHeader('x-user-professor-id', String(req.identity.professorId));
    }
    if (req.identity.nome) {
      proxyReq.setHeader('x-user-nome', encodeURIComponent(req.identity.nome));
    }
  }
}

function buildProxyRoutes(app) {
  proxyTargets.forEach(({ path, target, rewrite }) => {
    if (!target) {
      logger.warn('proxy_target_not_configured', { path });
      return;
    }

    app.use(
      path,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`${rewrite}`]: '' },
        proxyTimeout: 5000,
        timeout: 5000,
        on: {
          proxyReq: injectIdentityHeaders,
          error: (err, req, res) => {
            proxyErrorsTotal.inc({ target: path });
            logger.error('proxy_error', { target: path, message: err.message });
            if (!res.headersSent) {
              res.status(503).json({ error: 'Serviço temporariamente indisponível' });
            }
          },
        },
      }),
    );
  });
}

module.exports = buildProxyRoutes;
