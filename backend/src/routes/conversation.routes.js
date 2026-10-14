const express = require('express');
const ConversationController = require('../controllers/ConversationController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(AuthMiddleware.requireAuth);

router.get('/', ConversationController.index);
router.post('/', ConversationController.store);
router.get('/:id/messages', ConversationController.messages);

module.exports = router;
