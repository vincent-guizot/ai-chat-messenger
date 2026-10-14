const express = require('express');
const HealthController = require('../controllers/HealthController');
const authRoutes = require('./auth.routes');
const conversationRoutes = require('./conversation.routes');

const router = express.Router();

router.get('/health', HealthController.check);
router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);

module.exports = router;
