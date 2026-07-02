const prisma = require('../prismaClient');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { isHoraValida } = require('../utils/time');
const salaServiceClient = require('../clients/salaServiceClient');
const equipamentoServiceClient = require('../clients/equipamentoServiceClient');
const professorServiceClient = require('../clients/professorServiceClient');
const {
  reservasGauge,
  reservasCriadasTotal,
  reservasConflitoTotal,
  reservasCanceladasTotal,
} = require('../config/metrics');

async function refreshReservasGauge() {
  const total = await prisma.reserva.count({ where: { status: 'ATIVA' } });
  reservasGauge.set(total);
}

function validarPayload({ turma, espacoId, data, horaInicio, horaFim }) {
  if (!turma || !espacoId || !data || !horaInicio || !horaFim) {
    throw new AppError(400, 'turma, espacoId, data, horaInicio e horaFim são obrigatórios');
  }
  if (!isHoraValida(horaInicio) || !isHoraValida(horaFim)) {
    throw new AppError(400, 'horaInicio e horaFim devem estar no formato HH:MM (24h)');
  }
  if (horaInicio >= horaFim) {
    throw new AppError(400, 'horaInicio deve ser anterior a horaFim');
  }
}

async function buscarConflitoSala({ espacoId, data, horaInicio, horaFim, excludeId }) {
  return prisma.reserva.findFirst({
    where: {
      espacoId,
      data,
      status: 'ATIVA',
      horaInicio: { lt: horaFim },
      horaFim: { gt: horaInicio },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

async function buscarConflitoProfessor({ professorId, data, horaInicio, horaFim, excludeId }) {
  return prisma.reserva.findFirst({
    where: {
      professorId,
      data,
      status: 'ATIVA',
      horaInicio: { lt: horaFim },
      horaFim: { gt: horaInicio },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

async function quantidadeReservadaEquipamento({ equipamentoId, data, horaInicio, horaFim, excludeId }) {
  const registros = await prisma.reservaEquipamento.findMany({
    where: {
      equipamentoId,
      reserva: {
        data,
        status: 'ATIVA',
        horaInicio: { lt: horaFim },
        horaFim: { gt: horaInicio },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    },
    select: { quantidade: true },
  });
  return registros.reduce((soma, r) => soma + r.quantidade, 0);
}

async function validarEspaco(espacoId) {
  const espaco = await salaServiceClient.buscarEspaco(espacoId);
  if (!espaco) throw new AppError(404, 'Sala/laboratório não encontrado');
  if (!espaco.ativo) throw new AppError(409, 'Sala/laboratório está inativo e não pode ser reservado');
  return espaco;
}

async function validarProfessor(professorId) {
  const professor = await professorServiceClient.buscarProfessor(professorId);
  if (!professor) throw new AppError(404, 'Professor não encontrado');
  if (!professor.ativo) throw new AppError(409, 'Professor está inativo e não pode reservar');
  return professor;
}

async function validarEquipamentos(equipamentos, { data, horaInicio, horaFim, excludeId }) {
  if (!equipamentos || equipamentos.length === 0) return;

  for (const item of equipamentos) {
    if (!item.equipamentoId || !item.quantidade || item.quantidade <= 0) {
      throw new AppError(400, 'Cada equipamento precisa de equipamentoId e quantidade > 0');
    }

    const equipamento = await equipamentoServiceClient.buscarEquipamento(item.equipamentoId);
    if (!equipamento) throw new AppError(404, `Equipamento ${item.equipamentoId} não encontrado`);
    if (!equipamento.ativo || !equipamento.disponivel) {
      throw new AppError(409, `Equipamento "${equipamento.nome}" não está disponível para reserva`);
    }
    if (item.quantidade > equipamento.quantidadeTotal) {
      throw new AppError(
        409,
        `Quantidade solicitada de "${equipamento.nome}" excede o total existente (${equipamento.quantidadeTotal})`,
      );
    }

    const jaReservado = await quantidadeReservadaEquipamento({
      equipamentoId: item.equipamentoId,
      data,
      horaInicio,
      horaFim,
      excludeId,
    });

    if (jaReservado + item.quantidade > equipamento.quantidadeTotal) {
      reservasConflitoTotal.inc({ tipo: 'equipamento' });
      throw new AppError(
        409,
        `Equipamento "${equipamento.nome}" não possui unidades suficientes disponíveis neste horário`,
      );
    }
  }
}

async function criarReserva(payload, user) {
  const {
    disciplinaId,
    cursoId,
    turma,
    espacoId,
    data,
    horaInicio,
    horaFim,
    observacoes,
    equipamentos,
  } = payload;

  const professorId = user.role === 'ADMIN' ? payload.professorId : user.professorId;
  if (!professorId) {
    throw new AppError(400, 'professorId é obrigatório');
  }

  validarPayload({ turma, espacoId, data, horaInicio, horaFim });

  const dataObj = new Date(`${data}T00:00:00.000Z`);
  if (Number.isNaN(dataObj.getTime())) {
    throw new AppError(400, 'data inválida, use o formato YYYY-MM-DD');
  }

  await validarEspaco(espacoId);
  await validarProfessor(professorId);

  const conflitoSala = await buscarConflitoSala({ espacoId, data: dataObj, horaInicio, horaFim });
  if (conflitoSala) {
    reservasConflitoTotal.inc({ tipo: 'sala' });
    throw new AppError(409, 'Já existe uma reserva ativa para esta sala/laboratório neste horário');
  }

  const conflitoProfessor = await buscarConflitoProfessor({
    professorId,
    data: dataObj,
    horaInicio,
    horaFim,
  });
  if (conflitoProfessor) {
    reservasConflitoTotal.inc({ tipo: 'professor' });
    throw new AppError(409, 'Professor já possui uma reserva ativa neste horário');
  }

  await validarEquipamentos(equipamentos, { data: dataObj, horaInicio, horaFim });

  const reserva = await prisma.reserva.create({
    data: {
      disciplinaId: disciplinaId || null,
      cursoId: cursoId || null,
      turma,
      professorId,
      espacoId,
      data: dataObj,
      horaInicio,
      horaFim,
      observacoes: observacoes || null,
      criadoPor: user.id,
      equipamentos: {
        create: (equipamentos || []).map((e) => ({
          equipamentoId: e.equipamentoId,
          quantidade: e.quantidade,
        })),
      },
    },
    include: { equipamentos: true },
  });

  reservasCriadasTotal.inc();
  await refreshReservasGauge();
  logger.info('reserva_criada', { reservaId: reserva.id, professorId, espacoId, criadoPor: user.id });

  return reserva;
}

async function buscarReservaPorId(id) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: Number(id) },
    include: { equipamentos: true },
  });
  if (!reserva) throw new AppError(404, 'Reserva não encontrada');
  return reserva;
}

function garantirPermissao(reserva, user) {
  if (user.role === 'ADMIN') return;
  if (reserva.criadoPor !== user.id) {
    throw new AppError(403, 'Você só pode alterar suas próprias reservas');
  }
}

async function atualizarReserva(id, payload, user) {
  const reserva = await buscarReservaPorId(id);
  garantirPermissao(reserva, user);

  if (reserva.status === 'CANCELADA') {
    throw new AppError(409, 'Não é possível alterar uma reserva cancelada');
  }

  const turma = payload.turma ?? reserva.turma;
  const espacoId = payload.espacoId ?? reserva.espacoId;
  const horaInicio = payload.horaInicio ?? reserva.horaInicio;
  const horaFim = payload.horaFim ?? reserva.horaFim;
  const data = payload.data ?? reserva.data.toISOString().slice(0, 10);
  const professorId =
    user.role === 'ADMIN' ? payload.professorId ?? reserva.professorId : reserva.professorId;

  validarPayload({ turma, espacoId, data, horaInicio, horaFim });

  const dataObj = new Date(`${data}T00:00:00.000Z`);
  if (Number.isNaN(dataObj.getTime())) {
    throw new AppError(400, 'data inválida, use o formato YYYY-MM-DD');
  }

  if (espacoId !== reserva.espacoId) {
    await validarEspaco(espacoId);
  }
  if (professorId !== reserva.professorId) {
    await validarProfessor(professorId);
  }

  const conflitoSala = await buscarConflitoSala({
    espacoId,
    data: dataObj,
    horaInicio,
    horaFim,
    excludeId: reserva.id,
  });
  if (conflitoSala) {
    reservasConflitoTotal.inc({ tipo: 'sala' });
    throw new AppError(409, 'Já existe uma reserva ativa para esta sala/laboratório neste horário');
  }

  const conflitoProfessor = await buscarConflitoProfessor({
    professorId,
    data: dataObj,
    horaInicio,
    horaFim,
    excludeId: reserva.id,
  });
  if (conflitoProfessor) {
    reservasConflitoTotal.inc({ tipo: 'professor' });
    throw new AppError(409, 'Professor já possui uma reserva ativa neste horário');
  }

  const equipamentos = payload.equipamentos;
  if (equipamentos) {
    await validarEquipamentos(equipamentos, { data: dataObj, horaInicio, horaFim, excludeId: reserva.id });
  }

  const atualizada = await prisma.$transaction(async (tx) => {
    if (equipamentos) {
      await tx.reservaEquipamento.deleteMany({ where: { reservaId: reserva.id } });
    }

    return tx.reserva.update({
      where: { id: reserva.id },
      data: {
        disciplinaId: payload.disciplinaId ?? reserva.disciplinaId,
        cursoId: payload.cursoId ?? reserva.cursoId,
        turma,
        professorId,
        espacoId,
        data: dataObj,
        horaInicio,
        horaFim,
        observacoes: payload.observacoes ?? reserva.observacoes,
        ...(equipamentos
          ? {
              equipamentos: {
                create: equipamentos.map((e) => ({
                  equipamentoId: e.equipamentoId,
                  quantidade: e.quantidade,
                })),
              },
            }
          : {}),
      },
      include: { equipamentos: true },
    });
  });

  logger.info('reserva_atualizada', { reservaId: reserva.id, usuarioId: user.id });
  return atualizada;
}

async function cancelarReserva(id, user) {
  const reserva = await buscarReservaPorId(id);
  garantirPermissao(reserva, user);

  if (reserva.status === 'CANCELADA') {
    throw new AppError(409, 'Reserva já está cancelada');
  }

  const cancelada = await prisma.reserva.update({
    where: { id: reserva.id },
    data: { status: 'CANCELADA' },
  });

  reservasCanceladasTotal.inc();
  await refreshReservasGauge();
  logger.info('reserva_cancelada', { reservaId: reserva.id, usuarioId: user.id });

  return cancelada;
}

async function listarReservas(filtros, user) {
  const where = { status: filtros.status || undefined };

  if (user.role === 'PROFESSOR') {
    where.professorId = user.professorId;
  } else if (filtros.professorId) {
    where.professorId = Number(filtros.professorId);
  }

  if (filtros.espacoId) where.espacoId = Number(filtros.espacoId);
  if (filtros.data) where.data = new Date(`${filtros.data}T00:00:00.000Z`);

  return prisma.reserva.findMany({
    where,
    include: { equipamentos: true },
    orderBy: [{ data: 'desc' }, { horaInicio: 'asc' }],
  });
}

async function verificarDisponibilidade({ espacoId, data, horaInicio, horaFim }) {
  if (!espacoId || !data || !horaInicio || !horaFim) {
    throw new AppError(400, 'espacoId, data, horaInicio e horaFim são obrigatórios');
  }
  if (!isHoraValida(horaInicio) || !isHoraValida(horaFim)) {
    throw new AppError(400, 'horaInicio e horaFim devem estar no formato HH:MM (24h)');
  }

  const dataObj = new Date(`${data}T00:00:00.000Z`);
  const conflito = await buscarConflitoSala({
    espacoId: Number(espacoId),
    data: dataObj,
    horaInicio,
    horaFim,
  });

  return {
    disponivel: !conflito,
    conflito: conflito
      ? { horaInicio: conflito.horaInicio, horaFim: conflito.horaFim, turma: conflito.turma }
      : null,
  };
}

/**
 * Endpoint público usado pelo consulta-service para montar a grade de
 * horários visível ao aluno. Não expõe observações nem quem criou a reserva.
 */
async function listarGradePublica(filtros) {
  const where = { status: 'ATIVA' };
  if (filtros.espacoId) where.espacoId = Number(filtros.espacoId);
  if (filtros.professorId) where.professorId = Number(filtros.professorId);
  if (filtros.data) where.data = new Date(`${filtros.data}T00:00:00.000Z`);

  const reservas = await prisma.reserva.findMany({
    where,
    select: {
      id: true,
      disciplinaId: true,
      cursoId: true,
      turma: true,
      professorId: true,
      espacoId: true,
      data: true,
      horaInicio: true,
      horaFim: true,
      equipamentos: { select: { equipamentoId: true, quantidade: true } },
    },
    orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
  });

  return reservas;
}

module.exports = {
  criarReserva,
  buscarReservaPorId,
  atualizarReserva,
  cancelarReserva,
  listarReservas,
  verificarDisponibilidade,
  listarGradePublica,
  refreshReservasGauge,
};
