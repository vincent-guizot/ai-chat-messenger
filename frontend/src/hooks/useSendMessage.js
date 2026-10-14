import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket from '../lib/socket';
import ChatCache from '../lib/chatCache';
import { useAuthStore } from '../stores/authStore';

// Setelah berhenti mengetik selama ini, kirim "typing: false".
const TYPING_IDLE_MS = 2000;

/**
 * Mengirim pesan & memberi tahu lawan bicara bahwa user sedang mengetik.
 */
export default function useSendMessage(conversationId) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isTypingRef = useRef(false);
  const idleTimerRef = useRef(null);

  let currentUserId = null;
  if (user) {
    currentUserId = user.id;
  }

  const stopTyping = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);

    if (isTypingRef.current && conversationId) {
      socket.emit('typing', { conversationId: conversationId, isTyping: false });
    }

    isTypingRef.current = false;
  }, [conversationId]);

  // Saat pindah percakapan (atau komponen dilepas), hentikan status mengetik.
  useEffect(() => {
    return stopTyping;
  }, [stopTyping]);

  const notifyTyping = useCallback(() => {
    if (!conversationId) {
      return;
    }

    // Event "mulai mengetik" hanya dikirim sekali, bukan di setiap ketikan.
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId: conversationId, isTyping: true });
    }

    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(stopTyping, TYPING_IDLE_MS);
  }, [conversationId, stopTyping]);

  const sendMessage = useCallback((text) => {
    const content = text.trim();

    if (content === '' || !conversationId) {
      return;
    }

    stopTyping();

    // Tampilkan pesan langsung, lalu diganti dengan pesan asli saat server membalas.
    ChatCache.addTemporaryMessage(queryClient, conversationId, currentUserId, content);
    socket.emit('message:create', { conversationId: conversationId, content: content });
  }, [conversationId, currentUserId, queryClient, stopTyping]);

  return {
    sendMessage: sendMessage,
    notifyTyping: notifyTyping,
  };
}
