import ApiClient from './ApiClient';

class NotificationApi {
  /**
   * Mengembalikan { notifications, unreadCount }.
   */
  static async getAll(token) {
    const data = await ApiClient.get('/api/notifications', token);

    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  }

  static async markAsRead(notificationId, token) {
    const data = await ApiClient.patch(`/api/notifications/${notificationId}/read`, {}, token);
    return data.notification;
  }

  /**
   * Tandai semua sudah dibaca. Jika conversationId diisi, hanya untuk percakapan itu.
   */
  static async markAllAsRead(conversationId, token) {
    const body = {};

    if (conversationId) {
      body.conversationId = conversationId;
    }

    const data = await ApiClient.patch('/api/notifications/read-all', body, token);
    return data.updatedCount;
  }
}

export default NotificationApi;
