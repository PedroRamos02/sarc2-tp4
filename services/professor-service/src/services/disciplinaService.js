const prisma = require('../prismaClient');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { disciplinasGauge } = require('../config/metrics');

async function refreshDisciplinasGauge() {
  const total = await prisma.disciplina.count({ where: { ativo: true } });
  disciplinasGauge.set(total);
}

async function listarDisciplinas({ ativo, cursoId } = {}) {
  return prisma.disciplina.findMany({
    where: {
      ...(ativo !== undefined ? { ativo } : {}),
      ...(cursoId !== undefined ? { cursoId: Number(cursoId) } : {}),
    },
    orderBy: { nome: 'asc' },
  });
}

async function buscarDisciplinaPorId(id) {
  const disciplina = await prisma.disciplina.findUnique({ where: { id: Number(id) } });
  if (!disciplina) throw new AppError(404, 'Disciplina não encontrada');
  return disciplina;
}

async function garantirCursoExiste(cursoId) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(cursoId) } });
  if (!curso) throw new AppError(400, 'Curso informado não existe');
  return curso;
}

async function criarDisciplina({ nome, codigo, cursoId, cargaHoraria }) {
  if (!nome || !codigo || !cursoId || !cargaHoraria) {
    throw new AppError(400, 'nome, codigo, cursoId e cargaHoraria são obrigatórios');
  }

  await garantirCursoExiste(cursoId);

  const existente = await prisma.disciplina.findUnique({ where: { codigo } });
  if (existente) {
    throw new AppError(409, 'Já existe uma disciplina cadastrada com este código');
  }

  const disciplina = await prisma.disciplina.create({
    data: {
      nome,
      codigo,
      cursoId: Number(cursoId),
      cargaHoraria: Number(cargaHoraria),
    },
  });

  await refreshDisciplinasGauge();
  logger.info('disciplina_criada', { disciplinaId: disciplina.id });

  return disciplina;
}

async function atualizarDisciplina(id, { nome, codigo, cursoId, cargaHoraria }) {
  const disciplina = await prisma.disciplina.findUnique({ where: { id: Number(id) } });
  if (!disciplina) throw new AppError(404, 'Disciplina não encontrada');

  if (cursoId !== undefined) {
    await garantirCursoExiste(cursoId);
  }

  if (codigo && codigo !== disciplina.codigo) {
    const existente = await prisma.disciplina.findUnique({ where: { codigo } });
    if (existente) {
      throw new AppError(409, 'Já existe uma disciplina cadastrada com este código');
    }
  }

  const atualizada = await prisma.disciplina.update({
    where: { id: disciplina.id },
    data: {
      ...(nome !== undefined ? { nome } : {}),
      ...(codigo !== undefined ? { codigo } : {}),
      ...(cursoId !== undefined ? { cursoId: Number(cursoId) } : {}),
      ...(cargaHoraria !== undefined ? { cargaHoraria: Number(cargaHoraria) } : {}),
    },
  });

  logger.info('disciplina_atualizada', { disciplinaId: disciplina.id });
  return atualizada;
}

async function atualizarStatusDisciplina(id, ativo) {
  const disciplina = await prisma.disciplina.findUnique({ where: { id: Number(id) } });
  if (!disciplina) throw new AppError(404, 'Disciplina não encontrada');

  const atualizada = await prisma.disciplina.update({
    where: { id: disciplina.id },
    data: { ativo },
  });

  await refreshDisciplinasGauge();
  logger.info('disciplina_status_atualizado', { disciplinaId: disciplina.id, ativo });
  return atualizada;
}

async function deletarDisciplina(id) {
  const disciplina = await prisma.disciplina.findUnique({ where: { id: Number(id) } });
  if (!disciplina) throw new AppError(404, 'Disciplina não encontrada');

  await prisma.disciplina.delete({ where: { id: disciplina.id } });
  await refreshDisciplinasGauge();
  logger.info('disciplina_removida', { disciplinaId: disciplina.id });
}

module.exports = {
  listarDisciplinas,
  buscarDisciplinaPorId,
  criarDisciplina,
  atualizarDisciplina,
  atualizarStatusDisciplina,
  deletarDisciplina,
  refreshDisciplinasGauge,
};
