const prisma = require('../prismaClient');
const { hashPassword } = require('../utils/password');
const generateTempPassword = require('../utils/generatePassword');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { usuariosGauge } = require('../config/metrics');

async function refreshUsuariosGauge() {
  const total = await prisma.usuario.count({ where: { ativo: true } });
  usuariosGauge.set(total);
}

async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      professorId: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { nome: 'asc' },
  });
}

async function buscarPorId(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } });
  if (!usuario) throw new AppError(404, 'Usuário não encontrado');
  return usuario;
}

/**
 * Chamado internamente pelo professor-service ao cadastrar um novo professor,
 * para criar a credencial de login correspondente.
 */
async function criarCredencialProfessor({ nome, email, professorId, senha }) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new AppError(409, 'Já existe um usuário cadastrado com este e-mail');
  }

  const senhaTemporaria = senha || generateTempPassword();
  const senhaHash = await hashPassword(senhaTemporaria);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      role: 'PROFESSOR',
      professorId,
      ativo: true,
    },
  });

  await refreshUsuariosGauge();
  logger.info('credencial_professor_criada', { usuarioId: usuario.id, professorId });

  return {
    id: usuario.id,
    email: usuario.email,
    senhaTemporaria,
  };
}

async function atualizarStatusPorProfessorId(professorId, ativo) {
  const usuario = await prisma.usuario.findFirst({ where: { professorId: Number(professorId) } });
  if (!usuario) throw new AppError(404, 'Credencial não encontrada para este professor');

  const atualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ativo },
  });

  await refreshUsuariosGauge();
  logger.info('credencial_professor_status_atualizado', { professorId, ativo });

  return atualizado;
}

async function atualizarDadosPorProfessorId(professorId, { nome, email }) {
  const usuario = await prisma.usuario.findFirst({ where: { professorId: Number(professorId) } });
  if (!usuario) throw new AppError(404, 'Credencial não encontrada para este professor');

  return prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      ...(nome ? { nome } : {}),
      ...(email ? { email } : {}),
    },
  });
}

module.exports = {
  listarUsuarios,
  buscarPorId,
  criarCredencialProfessor,
  atualizarStatusPorProfessorId,
  atualizarDadosPorProfessorId,
  refreshUsuariosGauge,
};
