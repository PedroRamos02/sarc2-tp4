const { Router } = require('express');
const cursoController = require('../controllers/cursoController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

router.get('/', cursoController.listar);
router.get('/:id', cursoController.buscarPorId);

router.post('/', identity, requireRole('ADMIN'), cursoController.criar);
router.put('/:id', identity, requireRole('ADMIN'), cursoController.atualizar);
router.patch('/:id/status', identity, requireRole('ADMIN'), cursoController.atualizarStatus);
router.delete('/:id', identity, requireRole('ADMIN'), cursoController.remover);

module.exports = router;
