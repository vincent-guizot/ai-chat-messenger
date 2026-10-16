import ApiClient from './ApiClient';

class NotificationApi {
  /**
   * Mengembalikan { notifications, unreadCount }.
   */
  static async getAll() {
    const data = await ApiClient.get('/api/notifications');

    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  }

  static async markAsRead(notificationId) {
    const data = await ApiClient.patch(`/api/notifications/${notificationId}/read`, {});
    return data.notification;
  }

  /**
   * Tandai semua sudah dibaca. Jika conversationId diisi, hanya untuk percakapan itu.
   */
  static async markAllAsRead(conversationId) {
    const body = {};

    if (conversationId) {
      body.conversationId = conversationId;
    }

    const data = await ApiClient.patch('/api/notifications/read-all', body);
    return data.updatedCount;
  }
}

export default NotificationApi;
