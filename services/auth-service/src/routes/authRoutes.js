const { Router } = require('express');
const authController = require('../controllers/authController');
const identity = require('../middlewares/identity');

const router = Router();

router.post('/login', authController.login);
router.get('/me', identity, authController.me);

module.exports = router;
