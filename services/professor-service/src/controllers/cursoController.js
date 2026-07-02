const asyncHandler = require('../utils/asyncHandler');
const cursoService = require('../services/cursoService');
const AppError = require('../utils/AppError');

function parseAtivo(value) {
  if (value === undefined) return undefined;
  return value === 'true';
}

const listar = asyncHandler(async (req, res) => {
  const cursos = await cursoService.listarCursos({ ativo: parseAtivo(req.query.ativo) });
  res.status(200).json(cursos);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const curso = await cursoService.buscarCursoPorId(req.params.id);
  res.status(200).json(curso);
});

const criar = asyncHandler(async (req, res) => {
  const { nome, codigo } = req.body;
  if (!nome || !codigo) {
    throw new AppError(400, 'nome e codigo são obrigatórios');
  }

  const curso = await cursoService.criarCurso({ nome, codigo });
  res.status(201).json(curso);
});

const atualizar = asyncHandler(async (req, res) => {
  const { nome, codigo } = req.body;
  const curso = await cursoService.atualizarCurso(req.params.id, { nome, codigo });
  res.status(200).json(curso);
});

const atualizarStatus = asyncHandler(async (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Campo "ativo" deve ser booleano');
  }

  const curso = await cursoService.atualizarStatusCurso(req.params.id, ativo);
  res.status(200).json(curso);
});

const remover = asyncHandler(async (req, res) => {
  await cursoService.deletarCurso(req.params.id);
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, atualizar, atualizarStatus, remover };
