const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const { readAllNotificationsSchema, notificationIdParamsSchema } = require('../validation/notification.schema');

const router = express.Router();

router.use(AuthMiddleware.requireAuth);

router.get('/', NotificationController.index);
// "/read-all" harus didaftarkan sebelum "/:id/read" agar tidak dianggap sebagai id.
router.patch(
  '/read-all',
  ValidationMiddleware.validateBody(readAllNotificationsSchema),
  NotificationController.markAllAsRead
);
router.patch(
  '/:id/read',
  ValidationMiddleware.validateParams(notificationIdParamsSchema),
  NotificationController.markAsRead
);

module.exports = router;
