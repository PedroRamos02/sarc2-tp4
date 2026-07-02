const { Router } = require('express');
const disciplinaController = require('../controllers/disciplinaController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

router.get('/', disciplinaController.listar);
router.get('/:id', disciplinaController.buscarPorId);

router.post('/', identity, requireRole('ADMIN'), disciplinaController.criar);
router.put('/:id', identity, requireRole('ADMIN'), disciplinaController.atualizar);
router.patch('/:id/status', identity, requireRole('ADMIN'), disciplinaController.atualizarStatus);
router.delete('/:id', identity, requireRole('ADMIN'), disciplinaController.remover);

module.exports = router;
