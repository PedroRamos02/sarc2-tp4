const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const http = axios.create({
  baseURL: process.env.SALA_SERVICE_URL,
  timeout: 3000,
});

/**
 * Consulta o endpoint público do sala-service. Retorna null em 404 (o
 * chamador decide o que fazer) e lança AppError(503) em falha de rede,
 * indicando indisponibilidade do serviço dependente.
 */
async function buscarEspaco(espacoId) {
  try {
    const { data } = await http.get(`/espacos/${espacoId}`);
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    logger.error('sala_service_indisponivel', { espacoId, message: err.message });
    throw new AppError(503, 'Serviço de salas indisponível no momento');
  }
}

module.exports = { buscarEspaco };
