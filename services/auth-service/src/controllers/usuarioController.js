const asyncHandler = require('../utils/asyncHandler');
const usuarioService = require('../services/usuarioService');
const AppError = require('../utils/AppError');

const listar = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.listarUsuarios();
  res.status(200).json(usuarios);
});

const criarCredencialProfessor = asyncHandler(async (req, res) => {
  const { nome, email, professorId, senha } = req.body;
  if (!nome || !email || !professorId) {
    throw new AppError(400, 'nome, email e professorId são obrigatórios');
  }

  const resultado = await usuarioService.criarCredencialProfessor({
    nome,
    email,
    professorId,
    senha,
  });
  res.status(201).json(resultado);
});

const atualizarStatusPorProfessorId = asyncHandler(async (req, res) => {
  const { professorId } = req.params;
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Campo "ativo" deve ser booleano');
  }

  const usuario = await usuarioService.atualizarStatusPorProfessorId(professorId, ativo);
  res.status(200).json(usuario);
});

const atualizarDadosPorProfessorId = asyncHandler(async (req, res) => {
  const { professorId } = req.params;
  const { nome, email } = req.body;

  const usuario = await usuarioService.atualizarDadosPorProfessorId(professorId, { nome, email });
  res.status(200).json(usuario);
});

module.exports = {
  listar,
  criarCredencialProfessor,
  atualizarStatusPorProfessorId,
  atualizarDadosPorProfessorId,
};
