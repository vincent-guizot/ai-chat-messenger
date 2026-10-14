const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(AuthMiddleware.requireAuth);

router.get('/', NotificationController.index);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

module.exports = router;
