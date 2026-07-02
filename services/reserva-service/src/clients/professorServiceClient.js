const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const http = axios.create({
  baseURL: process.env.PROFESSOR_SERVICE_URL,
  timeout: 3000,
});

async function buscarProfessor(professorId) {
  try {
    const { data } = await http.get(`/professores/${professorId}`);
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    logger.error('professor_service_indisponivel', { professorId, message: err.message });
    throw new AppError(503, 'Serviço de professores indisponível no momento');
  }
}

async function buscarDisciplina(disciplinaId) {
  try {
    const { data } = await http.get(`/disciplinas/${disciplinaId}`);
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    logger.error('professor_service_indisponivel', { disciplinaId, message: err.message });
    throw new AppError(503, 'Serviço de professores indisponível no momento');
  }
}

module.exports = { buscarProfessor, buscarDisciplina };
