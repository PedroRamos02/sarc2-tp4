const AppError = require('../utils/AppError');

/**
 * Protege rotas /internal/* usadas apenas por outros microsserviços na rede
 * Docker interna. Não substitui isolamento de rede, é uma camada adicional.
 */
function internalOnly(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return next(new AppError(403, 'Acesso restrito à comunicação interna entre serviços'));
  }
  next();
}

module.exports = internalOnly;
