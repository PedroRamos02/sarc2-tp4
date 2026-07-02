const { Router } = require('express');
const espacoController = require('../controllers/espacoController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

router.get('/', espacoController.listar);
router.get('/:id', espacoController.buscarPorId);

router.post('/', identity, requireRole('ADMIN'), espacoController.criar);
router.put('/:id', identity, requireRole('ADMIN'), espacoController.atualizar);
router.patch('/:id/status', identity, requireRole('ADMIN'), espacoController.atualizarStatus);
router.delete('/:id', identity, requireRole('ADMIN'), espacoController.remover);

module.exports = router;
