const prisma = require('../prismaClient');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { professoresGauge } = require('../config/metrics');
const authServiceClient = require('../clients/authServiceClient');

const SELECT_PUBLICO = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  departamento: true,
  ativo: true,
};

async function refreshProfessoresGauge() {
  const total = await prisma.professor.count({ where: { ativo: true } });
  professoresGauge.set(total);
}

async function listarProfessores({ ativo } = {}) {
  return prisma.professor.findMany({
    where: ativo !== undefined ? { ativo } : undefined,
    select: SELECT_PUBLICO,
    orderBy: { nome: 'asc' },
  });
}

async function buscarProfessorPorId(id) {
  const professor = await prisma.professor.findUnique({
    where: { id: Number(id) },
    select: SELECT_PUBLICO,
  });
  if (!professor) throw new AppError(404, 'Professor não encontrado');
  return professor;
}

async function criarProfessor({ nome, email, telefone, departamento }) {
  if (!nome || !email) {
    throw new AppError(400, 'nome e email são obrigatórios');
  }

  const existente = await prisma.professor.findUnique({ where: { email } });
  if (existente) {
    throw new AppError(409, 'Já existe um professor cadastrado com este e-mail');
  }

  const professor = await prisma.professor.create({
    data: { nome, email, telefone, departamento },
  });

  let credenciais;
  try {
    credenciais = await authServiceClient.criarCredencial({
      nome: professor.nome,
      email: professor.email,
      professorId: professor.id,
    });
  } catch (err) {
    await prisma.professor.delete({ where: { id: professor.id } });
    logger.error('professor_rollback_apos_falha_credencial', { professorId: professor.id });
    throw err;
  }

  await refreshProfessoresGauge();
  logger.info('professor_criado', { professorId: professor.id });

  return { ...professor, credenciais };
}

async function atualizarProfessor(id, { nome, telefone, departamento, email }) {
  const professor = await prisma.professor.findUnique({ where: { id: Number(id) } });
  if (!professor) throw new AppError(404, 'Professor não encontrado');

  const emailAlterado = email && email !== professor.email;
  if (emailAlterado) {
    const existente = await prisma.professor.findUnique({ where: { email } });
    if (existente) {
      throw new AppError(409, 'Já existe um professor cadastrado com este e-mail');
    }
  }

  const atualizado = await prisma.professor.update({
    where: { id: professor.id },
    data: {
      ...(nome !== undefined ? { nome } : {}),
      ...(telefone !== undefined ? { telefone } : {}),
      ...(departamento !== undefined ? { departamento } : {}),
      ...(emailAlterado ? { email } : {}),
    },
  });

  if (emailAlterado) {
    await authServiceClient.atualizarDados(professor.id, {
      nome: atualizado.nome,
      email: atualizado.email,
    });
  }

  logger.info('professor_atualizado', { professorId: professor.id });
  return atualizado;
}

async function atualizarStatusProfessor(id, ativo) {
  const professor = await prisma.professor.findUnique({ where: { id: Number(id) } });
  if (!professor) throw new AppError(404, 'Professor não encontrado');

  const atualizado = await prisma.professor.update({
    where: { id: professor.id },
    data: { ativo },
  });

  await authServiceClient.atualizarStatus(professor.id, ativo);
  await refreshProfessoresGauge();
  logger.info('professor_status_atualizado', { professorId: professor.id, ativo });

  return atualizado;
}

async function deletarProfessor(id) {
  const professor = await prisma.professor.findUnique({ where: { id: Number(id) } });
  if (!professor) throw new AppError(404, 'Professor não encontrado');

  await prisma.professor.delete({ where: { id: professor.id } });
  await refreshProfessoresGauge();
  logger.info('professor_removido', { professorId: professor.id });
}

module.exports = {
  listarProfessores,
  buscarProfessorPorId,
  criarProfessor,
  atualizarProfessor,
  atualizarStatusProfessor,
  deletarProfessor,
  refreshProfessoresGauge,
};
