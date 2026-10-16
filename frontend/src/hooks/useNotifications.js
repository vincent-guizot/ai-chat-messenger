import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NotificationApi from '@/api/NotificationApi';
import { queryKeys } from '@/lib/queryClient';
import NotificationCache from '@/lib/notificationCache';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

const EMPTY_RESULT = { notifications: [], unreadCount: 0 };

export function useNotificationsQuery() {
  const token = useAuthStore((state) => state.token);

  const query = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: NotificationApi.getAll,
    enabled: Boolean(token),
  });

  return {
    ...query,
    result: query.data || EMPTY_RESULT,
  };
}

/**
 * Jumlah notifikasi belum dibaca per percakapan: { [conversationId]: number }.
 * Dipakai untuk badge merah di daftar Direct Messages.
 */
export function useUnreadCountByConversation() {
  const notificationsQuery = useNotificationsQuery();
  const notifications = notificationsQuery.result.notifications;

  return useMemo(() => {
    const counts = {};

    for (const notification of notifications) {
      if (notification.readAt || !notification.conversationId) {
        continue;
      }

      counts[notification.conversationId] = (counts[notification.conversationId] || 0) + 1;
    }

    return counts;
  }, [notifications]);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => NotificationApi.markAsRead(notificationId),
    onMutate: (notificationId) => {
      // Langsung ubah tampilan tanpa menunggu server.
      NotificationCache.markAsRead(queryClient, (notification) => notification.id === notificationId);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId) => NotificationApi.markAllAsRead(conversationId),
    onMutate: (conversationId) => {
      NotificationCache.markAsRead(queryClient, (notification) => {
        if (!conversationId) {
          return true;
        }

        return notification.conversationId === conversationId;
      });
    },
  });
}

/**
 * Saat sebuah percakapan sedang dibuka, notifikasi dari percakapan itu otomatis ditandai sudah dibaca.
 */
export function useAutoReadActiveConversation() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const unreadByConversation = useUnreadCountByConversation();
  const markAllNotificationsRead = useMarkAllNotificationsRead();

  let unreadInActiveConversation = 0;
  if (activeConversationId) {
    unreadInActiveConversation = unreadByConversation[activeConversationId] || 0;
  }

  const mutate = markAllNotificationsRead.mutate;

  useEffect(() => {
    if (activeConversationId && unreadInActiveConversation > 0) {
      mutate(activeConversationId);
    }
  }, [activeConversationId, unreadInActiveConversation, mutate]);
}
