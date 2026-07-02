const { Router } = require('express');
const reservaController = require('../controllers/reservaController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

// Pública: consumida pelo consulta-service para montar a grade de horários do aluno.
router.get('/grade', reservaController.gradePublica);

router.use(identity, requireRole('ADMIN', 'PROFESSOR'));

router.get('/disponibilidade', reservaController.disponibilidade);
router.get('/', reservaController.listar);
router.post('/', reservaController.criar);
router.get('/:id', reservaController.buscarPorId);
router.put('/:id', reservaController.atualizar);
router.patch('/:id/cancelar', reservaController.cancelar);

module.exports = router;
