const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

function criarCliente(baseURL, nomeServico) {
  const http = axios.create({ baseURL, timeout: 3000 });

  return async function get(caminho, params) {
    try {
      const { data } = await http.get(caminho, { params });
      return data;
    } catch (err) {
      logger.error('dependencia_indisponivel', { servico: nomeServico, caminho, message: err.message });
      throw new AppError(503, `${nomeServico} está indisponível no momento`);
    }
  };
}

const getProfessor = criarCliente(process.env.PROFESSOR_SERVICE_URL, 'professor-service');
const getSala = criarCliente(process.env.SALA_SERVICE_URL, 'sala-service');
const getEquipamento = criarCliente(process.env.EQUIPAMENTO_SERVICE_URL, 'equipamento-service');
const getReserva = criarCliente(process.env.RESERVA_SERVICE_URL, 'reserva-service');

module.exports = { getProfessor, getSala, getEquipamento, getReserva };
