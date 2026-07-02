const AppError = require('../utils/AppError');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Autenticação necessária'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Você não tem permissão para executar esta ação'));
    }
    next();
  };
}

module.exports = requireRole;
