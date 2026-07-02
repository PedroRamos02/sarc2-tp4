const prisma = require('../prismaClient');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { loginsTotal } = require('../config/metrics');

async function login({ email, senha }) {
  const usuario = email
    ? await prisma.usuario.findUnique({ where: { email } })
    : null;

  if (!usuario || !usuario.ativo) {
    loginsTotal.inc({ status: 'failure' });
    logger.warn('login_failed', { email, reason: !usuario ? 'not_found' : 'inactive' });
    throw new AppError(401, 'E-mail ou senha inválidos');
  }

  const senhaOk = await comparePassword(senha || '', usuario.senhaHash);
  if (!senhaOk) {
    loginsTotal.inc({ status: 'failure' });
    logger.warn('login_failed', { email, reason: 'wrong_password' });
    throw new AppError(401, 'E-mail ou senha inválidos');
  }

  const token = signToken({
    sub: usuario.id,
    role: usuario.role,
    professorId: usuario.professorId,
    nome: usuario.nome,
    email: usuario.email,
  });

  loginsTotal.inc({ status: 'success' });
  logger.info('login_success', { userId: usuario.id, role: usuario.role });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      professorId: usuario.professorId,
    },
  };
}

module.exports = { login };
