const asyncHandler = require('../utils/asyncHandler');
const disciplinaService = require('../services/disciplinaService');
const AppError = require('../utils/AppError');

function parseAtivo(value) {
  if (value === undefined) return undefined;
  return value === 'true';
}

const listar = asyncHandler(async (req, res) => {
  const disciplinas = await disciplinaService.listarDisciplinas({
    ativo: parseAtivo(req.query.ativo),
    cursoId: req.query.cursoId,
  });
  res.status(200).json(disciplinas);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const disciplina = await disciplinaService.buscarDisciplinaPorId(req.params.id);
  res.status(200).json(disciplina);
});

const criar = asyncHandler(async (req, res) => {
  const { nome, codigo, cursoId, cargaHoraria } = req.body;
  if (!nome || !codigo || !cursoId || !cargaHoraria) {
    throw new AppError(400, 'nome, codigo, cursoId e cargaHoraria são obrigatórios');
  }

  const disciplina = await disciplinaService.criarDisciplina({ nome, codigo, cursoId, cargaHoraria });
  res.status(201).json(disciplina);
});

const atualizar = asyncHandler(async (req, res) => {
  const { nome, codigo, cursoId, cargaHoraria } = req.body;
  const disciplina = await disciplinaService.atualizarDisciplina(req.params.id, {
    nome,
    codigo,
    cursoId,
    cargaHoraria,
  });
  res.status(200).json(disciplina);
});

const atualizarStatus = asyncHandler(async (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Campo "ativo" deve ser booleano');
  }

  const disciplina = await disciplinaService.atualizarStatusDisciplina(req.params.id, ativo);
  res.status(200).json(disciplina);
});

const remover = asyncHandler(async (req, res) => {
  await disciplinaService.deletarDisciplina(req.params.id);
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, atualizar, atualizarStatus, remover };
