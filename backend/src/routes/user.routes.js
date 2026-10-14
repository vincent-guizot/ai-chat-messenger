const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(AuthMiddleware.requireAuth);

router.get('/', UserController.index);
router.get('/me', UserController.me);

module.exports = router;
