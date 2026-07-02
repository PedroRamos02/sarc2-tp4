const asyncHandler = require('../utils/asyncHandler');
const reservaService = require('../services/reservaService');
const AppError = require('../utils/AppError');

const criar = asyncHandler(async (req, res) => {
  const reserva = await reservaService.criarReserva(req.body, req.user);
  res.status(201).json(reserva);
});

const listar = asyncHandler(async (req, res) => {
  const reservas = await reservaService.listarReservas(req.query, req.user);
  res.status(200).json(reservas);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const reserva = await reservaService.buscarReservaPorId(req.params.id);
  if (req.user.role !== 'ADMIN' && reserva.criadoPor !== req.user.id) {
    throw new AppError(403, 'Você não tem permissão para visualizar esta reserva');
  }
  res.status(200).json(reserva);
});

const atualizar = asyncHandler(async (req, res) => {
  const reserva = await reservaService.atualizarReserva(req.params.id, req.body, req.user);
  res.status(200).json(reserva);
});

const cancelar = asyncHandler(async (req, res) => {
  const reserva = await reservaService.cancelarReserva(req.params.id, req.user);
  res.status(200).json(reserva);
});

const disponibilidade = asyncHandler(async (req, res) => {
  const resultado = await reservaService.verificarDisponibilidade(req.query);
  res.status(200).json(resultado);
});

const gradePublica = asyncHandler(async (req, res) => {
  const reservas = await reservaService.listarGradePublica(req.query);
  res.status(200).json(reservas);
});

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  cancelar,
  disponibilidade,
  gradePublica,
};
