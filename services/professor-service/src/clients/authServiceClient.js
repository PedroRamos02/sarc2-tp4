const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const http = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL,
  timeout: 3000,
  headers: { 'x-internal-key': process.env.INTERNAL_API_KEY },
});

/**
 * Cria a credencial de login do professor no auth-service. Falha aqui deve
 * interromper o cadastro do professor (rollback feito pelo chamador).
 */
async function criarCredencial({ nome, email, professorId }) {
  try {
    const { data } = await http.post('/internal/usuarios', { nome, email, professorId });
    return data;
  } catch (err) {
    logger.error('auth_service_criar_credencial_falhou', {
      professorId,
      message: err.message,
    });
    throw new AppError(502, 'Professor não pôde ser cadastrado: falha ao criar credencial de acesso');
  }
}

/**
 * Sincroniza nome/e-mail no auth-service. Falha aqui não deve bloquear a
 * atualização do professor, que já foi persistida localmente.
 */
async function atualizarDados(professorId, { nome, email }) {
  try {
    await http.patch(`/internal/usuarios/professor/${professorId}/dados`, { nome, email });
  } catch (err) {
    logger.warn('auth_service_atualizar_dados_falhou', {
      professorId,
      message: err.message,
    });
  }
}

/**
 * Ativa/desativa o login do professor no auth-service. Falha aqui não deve
 * bloquear a atualização de status do professor.
 */
async function atualizarStatus(professorId, ativo) {
  try {
    await http.patch(`/internal/usuarios/professor/${professorId}/status`, { ativo });
  } catch (err) {
    logger.warn('auth_service_atualizar_status_falhou', {
      professorId,
      message: err.message,
    });
  }
}

module.exports = { criarCredencial, atualizarDados, atualizarStatus };
