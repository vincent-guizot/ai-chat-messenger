import { useCallback, useEffect, useRef, useState } from 'react';
import socket from '../lib/socket';
import ConversationApi from '../api/ConversationApi';
import { conversationHasAssistant } from '../utils/formatters';

const TOAST_DURATION_MS = 3500;
const TEMPORARY_ID_PREFIX = 'tmp-';

/**
 * Seluruh state & logika halaman chat:
 * koneksi socket, daftar percakapan, pesan, dan indikator "AI sedang mengetik".
 */
export default function useChat(token, currentUser) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [toastMessage, setToastMessage] = useState(null);

  // Socket handler dibuat sekali, jadi id percakapan aktif disimpan di ref agar selalu terbaru.
  const activeConversationIdRef = useRef(null);

  let currentUserId = null;
  if (currentUser) {
    currentUserId = currentUser.id;
  }

  const showToast = useCallback((message) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  }, []);

  const handleIncomingMessage = useCallback((incomingMessage) => {
    if (incomingMessage.conversationId !== activeConversationIdRef.current) {
      return;
    }

    setMessages((previousMessages) => {
      return mergeIncomingMessage(previousMessages, incomingMessage, currentUserId);
    });

    if (incomingMessage.senderRole === 'assistant') {
      setIsAssistantTyping(false);
    }
  }, [currentUserId]);

  // --- Koneksi socket -------------------------------------------------------
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    function handleConnect() {
      setConnectionStatus('connected');

      // Setelah reconnect, masuk lagi ke room percakapan yang sedang dibuka.
      if (activeConversationIdRef.current) {
        socket.emit('join', { conversationId: activeConversationIdRef.current });
      }
    }

    function handleDisconnect() {
      setConnectionStatus('disconnected');
    }

    function handleConnectError() {
      setConnectionStatus('error');
    }

    function handleServerError(payload) {
      setIsAssistantTyping(false);

      let errorText = 'Server error';
      if (payload && payload.message) {
        errorText = payload.message;
      }

      showToast(errorText);
    }

    socket.auth = { token: token };
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('error', handleServerError);
    socket.on('message:new', handleIncomingMessage);

    setConnectionStatus('connecting');
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('error', handleServerError);
      socket.off('message:new', handleIncomingMessage);
      socket.disconnect();
    };
  }, [token, handleIncomingMessage, showToast]);

  // --- Pesan ----------------------------------------------------------------
  const openConversation = useCallback(async (conversation) => {
    const previousConversationId = activeConversationIdRef.current;

    if (previousConversationId && previousConversationId !== conversation.id) {
      socket.emit('leave', { conversationId: previousConversationId });
    }

    activeConversationIdRef.current = conversation.id;
    setActiveConversation(conversation);
    setIsAssistantTyping(false);
    setLoadingMessages(true);

    try {
      const loadedMessages = await ConversationApi.getMessages(conversation.id, token);
      setMessages(loadedMessages);
      socket.emit('join', { conversationId: conversation.id });
    } catch (error) {
      setMessages([]);
      showToast(error.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [token, showToast]);

  // --- Percakapan -----------------------------------------------------------
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);

    try {
      const loadedConversations = await ConversationApi.getAll(token);
      setConversations(loadedConversations);

      if (loadedConversations.length > 0) {
        await openConversation(loadedConversations[0]);
      } else {
        activeConversationIdRef.current = null;
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, [token, openConversation, showToast]);

  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token, loadConversations]);

  const createAiConversation = useCallback(async () => {
    try {
      await ConversationApi.createAiConversation(token);
      await loadConversations();
    } catch (error) {
      showToast(error.message || 'Failed to create AI conversation');
    }
  }, [token, loadConversations, showToast]);

  // --- Kirim pesan ----------------------------------------------------------
  const sendMessage = useCallback((text) => {
    const content = text.trim();

    if (content === '' || !activeConversation) {
      return;
    }

    // Pesan sementara agar langsung tampil; akan diganti saat server mengirim pesan aslinya.
    const temporaryMessage = {
      id: `${TEMPORARY_ID_PREFIX}${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUserId,
      senderRole: 'user',
      content: content,
      createdAt: new Date().toISOString(),
    };

    setMessages((previousMessages) => {
      return [...previousMessages, temporaryMessage];
    });

    socket.emit('message:create', { conversationId: activeConversation.id, content: content });

    if (conversationHasAssistant(activeConversation)) {
      setIsAssistantTyping(true);
    }
  }, [activeConversation, currentUserId]);

  return {
    conversations: conversations,
    activeConversation: activeConversation,
    messages: messages,
    loadingConversations: loadingConversations,
    loadingMessages: loadingMessages,
    isAssistantTyping: isAssistantTyping,
    connectionStatus: connectionStatus,
    toastMessage: toastMessage,
    openConversation: openConversation,
    createAiConversation: createAiConversation,
    sendMessage: sendMessage,
  };
}

/**
 * Menambahkan pesan dari server ke daftar pesan:
 * - abaikan jika id-nya sudah ada,
 * - jika itu pesan milik user sendiri, ganti pesan sementara yang isinya sama,
 * - selain itu tambahkan di akhir.
 */
function mergeIncomingMessage(previousMessages, incomingMessage, currentUserId) {
  const alreadyExists = previousMessages.some((message) => message.id === incomingMessage.id);

  if (alreadyExists) {
    return previousMessages;
  }

  const isOwnMessage = incomingMessage.senderRole === 'user' && incomingMessage.senderId === currentUserId;

  if (isOwnMessage) {
    const temporaryIndex = previousMessages.findIndex((message) => {
      const isTemporary = String(message.id).startsWith(TEMPORARY_ID_PREFIX);
      return isTemporary && message.content === incomingMessage.content;
    });

    if (temporaryIndex !== -1) {
      const updatedMessages = [...previousMessages];
      updatedMessages[temporaryIndex] = incomingMessage;
      return updatedMessages;
    }
  }

  return [...previousMessages, incomingMessage];
}
