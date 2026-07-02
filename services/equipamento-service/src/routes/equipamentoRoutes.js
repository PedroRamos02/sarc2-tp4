const { Router } = require('express');
const equipamentoController = require('../controllers/equipamentoController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

router.get('/', equipamentoController.listar);
router.get('/:id', equipamentoController.buscarPorId);

router.post('/', identity, requireRole('ADMIN'), equipamentoController.criar);
router.put('/:id', identity, requireRole('ADMIN'), equipamentoController.atualizar);
router.patch('/:id/status', identity, requireRole('ADMIN'), equipamentoController.atualizarStatus);
router.patch(
  '/:id/disponibilidade',
  identity,
  requireRole('ADMIN'),
  equipamentoController.atualizarDisponibilidade,
);
router.delete('/:id', identity, requireRole('ADMIN'), equipamentoController.remover);

module.exports = router;
