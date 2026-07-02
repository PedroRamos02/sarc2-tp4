const asyncHandler = require('../utils/asyncHandler');
const professorService = require('../services/professorService');
const AppError = require('../utils/AppError');

function parseAtivo(value) {
  if (value === undefined) return undefined;
  return value === 'true';
}

const listar = asyncHandler(async (req, res) => {
  const professores = await professorService.listarProfessores({ ativo: parseAtivo(req.query.ativo) });
  res.status(200).json(professores);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const professor = await professorService.buscarProfessorPorId(req.params.id);
  res.status(200).json(professor);
});

const criar = asyncHandler(async (req, res) => {
  const { nome, email, telefone, departamento } = req.body;
  if (!nome || !email) {
    throw new AppError(400, 'nome e email são obrigatórios');
  }

  const professor = await professorService.criarProfessor({ nome, email, telefone, departamento });
  res.status(201).json(professor);
});

const atualizar = asyncHandler(async (req, res) => {
  const { nome, telefone, departamento, email } = req.body;
  const professor = await professorService.atualizarProfessor(req.params.id, {
    nome,
    telefone,
    departamento,
    email,
  });
  res.status(200).json(professor);
});

const atualizarStatus = asyncHandler(async (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Campo "ativo" deve ser booleano');
  }

  const professor = await professorService.atualizarStatusProfessor(req.params.id, ativo);
  res.status(200).json(professor);
});

const remover = asyncHandler(async (req, res) => {
  await professorService.deletarProfessor(req.params.id);
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, atualizar, atualizarStatus, remover };
