const prisma = require('../prismaClient');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { equipamentosGauge, unidadesGauge } = require('../config/metrics');

async function refreshEquipamentosGauge() {
  const ativos = await prisma.equipamento.findMany({
    where: { ativo: true },
    select: { quantidadeTotal: true },
  });
  equipamentosGauge.set(ativos.length);
  unidadesGauge.set(ativos.reduce((soma, e) => soma + e.quantidadeTotal, 0));
}

async function listarEquipamentos({ ativo, disponivel } = {}) {
  const where = {};
  if (ativo !== undefined) where.ativo = ativo;
  if (disponivel !== undefined) where.disponivel = disponivel;

  return prisma.equipamento.findMany({
    where,
    orderBy: { nome: 'asc' },
  });
}

async function buscarPorId(id) {
  const equipamento = await prisma.equipamento.findUnique({ where: { id: Number(id) } });
  if (!equipamento) throw new AppError(404, 'Equipamento não encontrado');
  return equipamento;
}

async function criarEquipamento({ nome, tipo, quantidadeTotal, disponivel }) {
  const equipamento = await prisma.equipamento.create({
    data: {
      nome,
      tipo,
      quantidadeTotal,
      disponivel: disponivel === undefined ? true : disponivel,
    },
  });

  await refreshEquipamentosGauge();
  logger.info('equipamento_criado', { equipamentoId: equipamento.id });

  return equipamento;
}

async function atualizarEquipamento(id, { nome, tipo, quantidadeTotal, disponivel }) {
  await buscarPorId(id);

  const equipamento = await prisma.equipamento.update({
    where: { id: Number(id) },
    data: {
      ...(nome !== undefined ? { nome } : {}),
      ...(tipo !== undefined ? { tipo } : {}),
      ...(quantidadeTotal !== undefined ? { quantidadeTotal } : {}),
      ...(disponivel !== undefined ? { disponivel } : {}),
    },
  });

  await refreshEquipamentosGauge();
  logger.info('equipamento_atualizado', { equipamentoId: equipamento.id });

  return equipamento;
}

async function atualizarStatus(id, ativo) {
  await buscarPorId(id);

  const equipamento = await prisma.equipamento.update({
    where: { id: Number(id) },
    data: { ativo },
  });

  await refreshEquipamentosGauge();
  logger.info('equipamento_status_atualizado', { equipamentoId: equipamento.id, ativo });

  return equipamento;
}

async function atualizarDisponibilidade(id, disponivel) {
  await buscarPorId(id);

  const equipamento = await prisma.equipamento.update({
    where: { id: Number(id) },
    data: { disponivel },
  });

  await refreshEquipamentosGauge();
  logger.info('equipamento_disponibilidade_atualizada', { equipamentoId: equipamento.id, disponivel });

  return equipamento;
}

async function removerEquipamento(id) {
  await buscarPorId(id);

  await prisma.equipamento.delete({ where: { id: Number(id) } });

  await refreshEquipamentosGauge();
  logger.info('equipamento_removido', { equipamentoId: Number(id) });
}

module.exports = {
  listarEquipamentos,
  buscarPorId,
  criarEquipamento,
  atualizarEquipamento,
  atualizarStatus,
  atualizarDisponibilidade,
  removerEquipamento,
  refreshEquipamentosGauge,
};
