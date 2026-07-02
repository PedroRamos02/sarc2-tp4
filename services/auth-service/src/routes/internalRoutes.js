const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const internalOnly = require('../middlewares/internalOnly');

const router = Router();

router.use(internalOnly);

router.post('/usuarios', usuarioController.criarCredencialProfessor);
router.patch('/usuarios/professor/:professorId/status', usuarioController.atualizarStatusPorProfessorId);
router.patch('/usuarios/professor/:professorId/dados', usuarioController.atualizarDadosPorProfessorId);

module.exports = router;
