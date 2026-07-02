const { Router } = require('express');
const consultaController = require('../controllers/consultaController');

const router = Router();

// Todas as rotas deste serviço são públicas — nenhum middleware de identidade.
router.get('/salas', consultaController.salas);
router.get('/laboratorios', consultaController.laboratorios);
router.get('/professores', consultaController.professores);
router.get('/equipamentos', consultaController.equipamentos);
router.get('/grade', consultaController.grade);

module.exports = router;
