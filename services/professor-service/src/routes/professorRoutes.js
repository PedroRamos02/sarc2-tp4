const { Router } = require('express');
const professorController = require('../controllers/professorController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

router.get('/', professorController.listar);
router.get('/:id', professorController.buscarPorId);

router.post('/', identity, requireRole('ADMIN'), professorController.criar);
router.put('/:id', identity, requireRole('ADMIN'), professorController.atualizar);
router.patch('/:id/status', identity, requireRole('ADMIN'), professorController.atualizarStatus);
router.delete('/:id', identity, requireRole('ADMIN'), professorController.remover);

module.exports = router;
