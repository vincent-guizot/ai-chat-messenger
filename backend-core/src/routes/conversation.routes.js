const express = require('express');
const ConversationController = require('../controllers/ConversationController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const {
  storeConversationSchema,
  directConversationSchema,
  conversationIdParamsSchema,
  messageIdParamsSchema,
} = require('../validation/conversation.schema');

const router = express.Router();

router.use(AuthMiddleware.requireAuth);

router.get('/', ConversationController.index);
router.post('/', ValidationMiddleware.validateBody(storeConversationSchema), ConversationController.store);
router.post('/direct', ValidationMiddleware.validateBody(directConversationSchema), ConversationController.direct);
router.get(
  '/:id/messages',
  ValidationMiddleware.validateParams(conversationIdParamsSchema),
  ConversationController.messages
);
router.delete(
  '/:id/messages/:messageId',
  ValidationMiddleware.validateParams(messageIdParamsSchema),
  ConversationController.destroyMessage
);
router.delete('/:id', ValidationMiddleware.validateParams(conversationIdParamsSchema), ConversationController.destroy);

module.exports = router;
