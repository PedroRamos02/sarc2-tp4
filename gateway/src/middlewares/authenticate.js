const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { authFailuresTotal } = require('../config/metrics');

/**
 * Verificação de JWT "opcional": se não houver Authorization header, a
 * requisição segue anônima (rotas públicas do consulta-service e as listagens
 * públicas de professores/salas/laboratórios/equipamentos dependem disso).
 * Se houver um header, ele PRECISA ser um Bearer token válido, senão a
 * requisição é rejeitada aqui mesmo — nunca repassada quebrada ao serviço de
 * destino. A autorização fina por role (ex: só ADMIN cria sala) é feita em
 * cada microsserviço, usando os headers x-user-* injetados após esta etapa.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.identity = null;
    return next();
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    authFailuresTotal.inc({ reason: 'malformed_header' });
    return next(new AppError(401, 'Cabeçalho de autorização inválido'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.identity = payload;
    next();
  } catch (err) {
    authFailuresTotal.inc({ reason: err.name === 'TokenExpiredError' ? 'expired' : 'invalid' });
    next(new AppError(401, 'Token inválido ou expirado'));
  }
}

module.exports = authenticate;
