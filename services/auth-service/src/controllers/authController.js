const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const AppError = require('../utils/AppError');

const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    throw new AppError(400, 'Informe e-mail e senha');
  }

  const resultado = await authService.login({ email, senha });
  res.status(200).json(resultado);
});

const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Autenticação necessária');
  }
  res.status(200).json({ usuario: req.user });
});

module.exports = { login, me };
