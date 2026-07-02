const prisma = require('../prismaClient');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { cursosGauge } = require('../config/metrics');

async function refreshCursosGauge() {
  const total = await prisma.curso.count({ where: { ativo: true } });
  cursosGauge.set(total);
}

async function listarCursos({ ativo } = {}) {
  return prisma.curso.findMany({
    where: ativo !== undefined ? { ativo } : undefined,
    orderBy: { nome: 'asc' },
  });
}

async function buscarCursoPorId(id) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(id) } });
  if (!curso) throw new AppError(404, 'Curso não encontrado');
  return curso;
}

async function criarCurso({ nome, codigo }) {
  if (!nome || !codigo) {
    throw new AppError(400, 'nome e codigo são obrigatórios');
  }

  const existente = await prisma.curso.findUnique({ where: { codigo } });
  if (existente) {
    throw new AppError(409, 'Já existe um curso cadastrado com este código');
  }

  const curso = await prisma.curso.create({ data: { nome, codigo } });
  await refreshCursosGauge();
  logger.info('curso_criado', { cursoId: curso.id });

  return curso;
}

async function atualizarCurso(id, { nome, codigo }) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(id) } });
  if (!curso) throw new AppError(404, 'Curso não encontrado');

  if (codigo && codigo !== curso.codigo) {
    const existente = await prisma.curso.findUnique({ where: { codigo } });
    if (existente) {
      throw new AppError(409, 'Já existe um curso cadastrado com este código');
    }
  }

  const atualizado = await prisma.curso.update({
    where: { id: curso.id },
    data: {
      ...(nome !== undefined ? { nome } : {}),
      ...(codigo !== undefined ? { codigo } : {}),
    },
  });

  logger.info('curso_atualizado', { cursoId: curso.id });
  return atualizado;
}

async function atualizarStatusCurso(id, ativo) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(id) } });
  if (!curso) throw new AppError(404, 'Curso não encontrado');

  const atualizado = await prisma.curso.update({
    where: { id: curso.id },
    data: { ativo },
  });

  await refreshCursosGauge();
  logger.info('curso_status_atualizado', { cursoId: curso.id, ativo });
  return atualizado;
}

async function deletarCurso(id) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(id) } });
  if (!curso) throw new AppError(404, 'Curso não encontrado');

  await prisma.curso.delete({ where: { id: curso.id } });
  await refreshCursosGauge();
  logger.info('curso_removido', { cursoId: curso.id });
}

module.exports = {
  listarCursos,
  buscarCursoPorId,
  criarCurso,
  atualizarCurso,
  atualizarStatusCurso,
  deletarCurso,
  refreshCursosGauge,
};
