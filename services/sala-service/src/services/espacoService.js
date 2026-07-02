const prisma = require('../prismaClient');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { espacosGauge } = require('../config/metrics');

const TIPOS_VALIDOS = ['SALA', 'LABORATORIO'];

async function refreshEspacosGauge() {
  const [salas, laboratorios] = await Promise.all([
    prisma.espaco.count({ where: { ativo: true, tipo: 'SALA' } }),
    prisma.espaco.count({ where: { ativo: true, tipo: 'LABORATORIO' } }),
  ]);
  espacosGauge.set({ tipo: 'SALA' }, salas);
  espacosGauge.set({ tipo: 'LABORATORIO' }, laboratorios);
}

async function listarEspacos({ tipo, ativo }) {
  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    throw new AppError(400, 'tipo deve ser SALA ou LABORATORIO');
  }

  const where = {
    ...(tipo ? { tipo } : {}),
    ...(ativo !== undefined ? { ativo: ativo === 'true' } : {}),
  };

  return prisma.espaco.findMany({ where, orderBy: { nome: 'asc' } });
}

async function buscarPorId(id) {
  const espaco = await prisma.espaco.findUnique({ where: { id: Number(id) } });
  if (!espaco) throw new AppError(404, 'Espaço não encontrado');
  return espaco;
}

async function criarEspaco({ nome, tipo, capacidade, bloco, descricao }) {
  if (!nome || !tipo || capacidade === undefined || capacidade === null) {
    throw new AppError(400, 'nome, tipo e capacidade são obrigatórios');
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new AppError(400, 'tipo deve ser SALA ou LABORATORIO');
  }
  if (Number(capacidade) <= 0) {
    throw new AppError(400, 'capacidade deve ser maior que zero');
  }

  const espaco = await prisma.espaco.create({
    data: {
      nome,
      tipo,
      capacidade: Number(capacidade),
      bloco: bloco || null,
      descricao: descricao || null,
    },
  });

  await refreshEspacosGauge();
  logger.info('espaco_criado', { espacoId: espaco.id, tipo: espaco.tipo });

  return espaco;
}

async function atualizarEspaco(id, { nome, tipo, capacidade, bloco, descricao }) {
  await buscarPorId(id);

  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    throw new AppError(400, 'tipo deve ser SALA ou LABORATORIO');
  }
  if (capacidade !== undefined && capacidade !== null && Number(capacidade) <= 0) {
    throw new AppError(400, 'capacidade deve ser maior que zero');
  }

  const espaco = await prisma.espaco.update({
    where: { id: Number(id) },
    data: {
      ...(nome !== undefined ? { nome } : {}),
      ...(tipo !== undefined ? { tipo } : {}),
      ...(capacidade !== undefined ? { capacidade: Number(capacidade) } : {}),
      ...(bloco !== undefined ? { bloco } : {}),
      ...(descricao !== undefined ? { descricao } : {}),
    },
  });

  await refreshEspacosGauge();
  logger.info('espaco_atualizado', { espacoId: espaco.id });

  return espaco;
}

async function atualizarStatus(id, ativo) {
  await buscarPorId(id);

  const espaco = await prisma.espaco.update({
    where: { id: Number(id) },
    data: { ativo },
  });

  await refreshEspacosGauge();
  logger.info('espaco_status_atualizado', { espacoId: espaco.id, ativo });

  return espaco;
}

async function removerEspaco(id) {
  await buscarPorId(id);

  await prisma.espaco.delete({ where: { id: Number(id) } });

  await refreshEspacosGauge();
  logger.info('espaco_removido', { espacoId: Number(id) });
}

module.exports = {
  listarEspacos,
  buscarPorId,
  criarEspaco,
  atualizarEspaco,
  atualizarStatus,
  removerEspaco,
  refreshEspacosGauge,
};
