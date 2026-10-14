import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket from '../lib/socket';
import { queryKeys } from '../lib/queryClient';
import ChatCache from '../lib/chatCache';
import NotificationCache from '../lib/notificationCache';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

// Jika event "berhenti mengetik" tidak pernah datang (mis. koneksi putus), indikator dihapus otomatis.
const TYPING_EXPIRE_MS = 6000;

/**
 * Membuka koneksi Socket.IO selama user login dan meneruskan setiap event
 * ke cache React Query (data) atau ke chatStore (status & indikator mengetik).
 */
export default function useChatSocket() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const typingTimersRef = useRef({});

  let currentUserId = null;
  if (user) {
    currentUserId = user.id;
  }

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const chatStore = useChatStore.getState();
    const typingTimers = typingTimersRef.current;

    function handleConnect() {
      chatStore.setConnectionStatus('connected');

      // Data bisa saja tertinggal selama koneksi terputus, jadi muat ulang.
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }

    function handleDisconnect() {
      chatStore.setConnectionStatus('disconnected');
    }

    function handleConnectError() {
      chatStore.setConnectionStatus('error');
    }

    function handleServerError(payload) {
      let errorText = 'Server error';
      if (payload && payload.message) {
        errorText = payload.message;
      }

      chatStore.showToast(errorText, 'error');
    }

    function handleNewMessage(message) {
      ChatCache.addMessage(queryClient, message, currentUserId);

      const conversationIsListed = ChatCache.moveConversationToTop(queryClient, message);

      // Percakapan baru dari orang lain (mis. DM pertama) -> ambil ulang daftar percakapan.
      if (!conversationIsListed) {
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      }

      if (message.senderRole === 'user' && message.senderId) {
        clearUserTyping(message.conversationId, message.senderId);
      }
    }

    function clearUserTyping(conversationId, userId) {
      const timerKey = `${conversationId}:${userId}`;

      window.clearTimeout(typingTimers[timerKey]);
      delete typingTimers[timerKey];
      useChatStore.getState().setUserTyping(conversationId, userId, false);
    }

    function handleTyping(payload) {
      if (!payload.isTyping) {
        clearUserTyping(payload.conversationId, payload.userId);
        return;
      }

      const timerKey = `${payload.conversationId}:${payload.userId}`;

      useChatStore.getState().setUserTyping(payload.conversationId, payload.userId, true);
      window.clearTimeout(typingTimers[timerKey]);

      typingTimers[timerKey] = window.setTimeout(() => {
        clearUserTyping(payload.conversationId, payload.userId);
      }, TYPING_EXPIRE_MS);
    }

    function handleAssistantTyping(payload) {
      useChatStore.getState().setAssistantTyping(payload.conversationId, payload.isTyping);
    }

    function handlePresenceUpdate(presence) {
      ChatCache.updateContactPresence(queryClient, presence);
    }

    function handleNewNotification(notification) {
      NotificationCache.add(queryClient, notification);

      // Notifikasi dari percakapan yang sedang dibuka tidak perlu ditampilkan sebagai toast
      // (akan otomatis ditandai sudah dibaca oleh useAutoReadActiveConversation).
      const activeConversationId = useChatStore.getState().activeConversationId;
      const isFromActiveConversation = notification.conversationId === activeConversationId;

      if (!isFromActiveConversation) {
        useChatStore.getState().showToast(notification.title, 'info');
      }
    }

    socket.auth = { token: token };
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('error', handleServerError);
    socket.on('message:new', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('assistant:typing', handleAssistantTyping);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('notification:new', handleNewNotification);

    chatStore.setConnectionStatus('connecting');
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('error', handleServerError);
      socket.off('message:new', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('assistant:typing', handleAssistantTyping);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('notification:new', handleNewNotification);
      socket.disconnect();

      for (const timerKey of Object.keys(typingTimers)) {
        window.clearTimeout(typingTimers[timerKey]);
      }
    };
  }, [token, currentUserId, queryClient]);
}
