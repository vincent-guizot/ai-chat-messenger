const NotificationService = require('../services/NotificationService');
const HttpError = require('../utils/HttpError');

class NotificationController {
  /**
   * GET /api/notifications
   * Daftar notifikasi terbaru + jumlah yang belum dibaca.
   */
  static async index(request, response, next) {
    try {
      const userId = request.user.id;
      const notifications = await NotificationService.findForUser(userId);
      const unreadCount = await NotificationService.countUnread(userId);

      return response.json({
        ok: true,
        notifications: notifications,
        unreadCount: unreadCount,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(request, response, next) {
    try {
      const notification = await NotificationService.markAsRead(request.params.id, request.user.id);

      if (!notification) {
        throw HttpError.notFound('notification not found');
      }

      return response.json({ ok: true, notification: notification });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Body (opsional): { conversationId } -> hanya notifikasi dari percakapan tersebut.
   */
  static async markAllAsRead(request, response, next) {
    try {
      let conversationId = null;
      if (request.body && request.body.conversationId) {
        conversationId = request.body.conversationId;
      }

      const updatedCount = await NotificationService.markAllAsRead(request.user.id, conversationId);

      return response.json({ ok: true, updatedCount: updatedCount });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = NotificationController;
