const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const http = axios.create({
  baseURL: process.env.EQUIPAMENTO_SERVICE_URL,
  timeout: 3000,
});

async function buscarEquipamento(equipamentoId) {
  try {
    const { data } = await http.get(`/equipamentos/${equipamentoId}`);
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    logger.error('equipamento_service_indisponivel', { equipamentoId, message: err.message });
    throw new AppError(503, 'Serviço de equipamentos indisponível no momento');
  }
}

module.exports = { buscarEquipamento };
