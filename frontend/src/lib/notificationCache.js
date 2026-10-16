import { queryKeys } from './queryClient';

/**
 * Fungsi untuk memperbarui cache notifikasi ({ notifications, unreadCount }) di React Query.
 */
class NotificationCache {
  static add(queryClient, notification) {
    queryClient.setQueryData(queryKeys.notifications, (previous) => {
      if (!previous) {
        return previous;
      }

      const alreadyExists = previous.notifications.some((item) => item.id === notification.id);

      if (alreadyExists) {
        return previous;
      }

      let unreadCount = previous.unreadCount;
      if (!notification.readAt) {
        unreadCount = unreadCount + 1;
      }

      return {
        notifications: [notification, ...previous.notifications],
        unreadCount: unreadCount,
      };
    });
  }

  /**
   * Menandai notifikasi yang cocok dengan fungsi "matches" sebagai sudah dibaca.
   */
  static markAsRead(queryClient, matches) {
    queryClient.setQueryData(queryKeys.notifications, (previous) => {
      if (!previous) {
        return previous;
      }

      const readAt = new Date().toISOString();
      let markedCount = 0;

      const notifications = previous.notifications.map((notification) => {
        if (notification.readAt || !matches(notification)) {
          return notification;
        }

        markedCount = markedCount + 1;
        return { ...notification, readAt: readAt };
      });

      return {
        notifications: notifications,
        unreadCount: Math.max(0, previous.unreadCount - markedCount),
      };
    });
  }
}

export default NotificationCache;
