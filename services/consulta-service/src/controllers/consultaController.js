const asyncHandler = require('../utils/asyncHandler');
const consultaService = require('../services/consultaService');
const { consultasTotal } = require('../config/metrics');

const salas = asyncHandler(async (req, res) => {
  consultasTotal.inc({ tipo: 'salas' });
  res.status(200).json(await consultaService.listarSalas());
});

const laboratorios = asyncHandler(async (req, res) => {
  consultasTotal.inc({ tipo: 'laboratorios' });
  res.status(200).json(await consultaService.listarLaboratorios());
});

const professores = asyncHandler(async (req, res) => {
  consultasTotal.inc({ tipo: 'professores' });
  res.status(200).json(await consultaService.listarProfessores());
});

const equipamentos = asyncHandler(async (req, res) => {
  consultasTotal.inc({ tipo: 'equipamentos' });
  res.status(200).json(await consultaService.listarEquipamentos());
});

const grade = asyncHandler(async (req, res) => {
  consultasTotal.inc({ tipo: 'grade' });
  res.status(200).json(await consultaService.montarGrade(req.query));
});

module.exports = { salas, laboratorios, professores, equipamentos, grade };
