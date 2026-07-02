const asyncHandler = require('../utils/asyncHandler');
const espacoService = require('../services/espacoService');
const AppError = require('../utils/AppError');

const listar = asyncHandler(async (req, res) => {
  const { tipo, ativo } = req.query;
  const espacos = await espacoService.listarEspacos({ tipo, ativo });
  res.status(200).json(espacos);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const espaco = await espacoService.buscarPorId(req.params.id);
  res.status(200).json(espaco);
});

const criar = asyncHandler(async (req, res) => {
  const { nome, tipo, capacidade, bloco, descricao } = req.body;
  const espaco = await espacoService.criarEspaco({ nome, tipo, capacidade, bloco, descricao });
  res.status(201).json(espaco);
});

const atualizar = asyncHandler(async (req, res) => {
  const { nome, tipo, capacidade, bloco, descricao } = req.body;
  const espaco = await espacoService.atualizarEspaco(req.params.id, {
    nome,
    tipo,
    capacidade,
    bloco,
    descricao,
  });
  res.status(200).json(espaco);
});

const atualizarStatus = asyncHandler(async (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Campo "ativo" deve ser booleano');
  }

  const espaco = await espacoService.atualizarStatus(req.params.id, ativo);
  res.status(200).json(espaco);
});

const remover = asyncHandler(async (req, res) => {
  await espacoService.removerEspaco(req.params.id);
  res.status(204).send();
});

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  atualizarStatus,
  remover,
};
