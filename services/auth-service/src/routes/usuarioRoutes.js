const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const identity = require('../middlewares/identity');
const requireRole = require('../middlewares/requireRole');

const router = Router();

router.get('/', identity, requireRole('ADMIN'), usuarioController.listar);

module.exports = router;
