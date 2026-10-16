const express = require('express');
const HealthController = require('../controllers/HealthController');
const AiController = require('../controllers/AiController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const { replySchema } = require('../validation/ai.schema');

const router = express.Router();

router.get('/health', HealthController.check);

// Endpoint AI hanya untuk backend-core, jadi dilindungi token bersama (jika dikonfigurasi).
router.post(
  '/ai/reply',
  AuthMiddleware.requireServiceToken,
  ValidationMiddleware.validateBody(replySchema),
  AiController.reply
);

module.exports = router;
