const asyncHandler = require('../utils/asyncHandler');
const equipamentoService = require('../services/equipamentoService');
const AppError = require('../utils/AppError');

function parseBooleanQuery(value) {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError(400, 'Parâmetro deve ser "true" ou "false"');
}

function validarQuantidadeTotal(quantidadeTotal) {
  if (!Number.isInteger(quantidadeTotal) || quantidadeTotal <= 0) {
    throw new AppError(400, 'quantidadeTotal deve ser um número inteiro maior que zero');
  }
}

const listar = asyncHandler(async (req, res) => {
  const ativo = parseBooleanQuery(req.query.ativo);
  const disponivel = parseBooleanQuery(req.query.disponivel);

  const equipamentos = await equipamentoService.listarEquipamentos({ ativo, disponivel });
  res.status(200).json(equipamentos);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const equipamento = await equipamentoService.buscarPorId(req.params.id);
  res.status(200).json(equipamento);
});

const criar = asyncHandler(async (req, res) => {
  const { nome, tipo, quantidadeTotal, disponivel } = req.body;
  if (!nome || !tipo || quantidadeTotal === undefined) {
    throw new AppError(400, 'nome, tipo e quantidadeTotal são obrigatórios');
  }
  validarQuantidadeTotal(quantidadeTotal);
  if (disponivel !== undefined && typeof disponivel !== 'boolean') {
    throw new AppError(400, 'Campo "disponivel" deve ser booleano');
  }

  const equipamento = await equipamentoService.criarEquipamento({
    nome,
    tipo,
    quantidadeTotal,
    disponivel,
  });
  res.status(201).json(equipamento);
});

const atualizar = asyncHandler(async (req, res) => {
  const { nome, tipo, quantidadeTotal, disponivel } = req.body;

  if (quantidadeTotal !== undefined) validarQuantidadeTotal(quantidadeTotal);
  if (disponivel !== undefined && typeof disponivel !== 'boolean') {
    throw new AppError(400, 'Campo "disponivel" deve ser booleano');
  }

  const equipamento = await equipamentoService.atualizarEquipamento(req.params.id, {
    nome,
    tipo,
    quantidadeTotal,
    disponivel,
  });
  res.status(200).json(equipamento);
});

const atualizarStatus = asyncHandler(async (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Campo "ativo" deve ser booleano');
  }

  const equipamento = await equipamentoService.atualizarStatus(req.params.id, ativo);
  res.status(200).json(equipamento);
});

const atualizarDisponibilidade = asyncHandler(async (req, res) => {
  const { disponivel } = req.body;
  if (typeof disponivel !== 'boolean') {
    throw new AppError(400, 'Campo "disponivel" deve ser booleano');
  }

  const equipamento = await equipamentoService.atualizarDisponibilidade(req.params.id, disponivel);
  res.status(200).json(equipamento);
});

const remover = asyncHandler(async (req, res) => {
  await equipamentoService.removerEquipamento(req.params.id);
  res.status(204).send();
});

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  atualizarStatus,
  atualizarDisponibilidade,
  remover,
};
