const express = require('express');
const ConversationController = require('../controllers/ConversationController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(AuthMiddleware.requireAuth);

router.get('/', ConversationController.index);
router.post('/', ConversationController.store);
router.post('/direct', ConversationController.direct);
router.get('/:id/messages', ConversationController.messages);
router.delete('/:id/messages/:messageId', ConversationController.destroyMessage);
router.delete('/:id', ConversationController.destroy);

module.exports = router;
