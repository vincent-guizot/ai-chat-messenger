import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConversationApi from '../api/ConversationApi';
import UserApi from '../api/UserApi';
import { queryKeys } from '../lib/queryClient';
import ChatCache from '../lib/chatCache';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { SIDEBAR_TABS, useUiStore } from '../stores/uiStore';
import { indexContactsById } from '../utils/conversations';

const EMPTY_LIST = [];

export function useConversationsQuery() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => ConversationApi.getAll(token),
    enabled: Boolean(token),
  });
}

export function useContactsQuery() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => UserApi.getContacts(token),
    enabled: Boolean(token),
  });
}

export function useMessagesQuery(conversationId) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => ConversationApi.getMessages(conversationId, token),
    enabled: Boolean(token) && Boolean(conversationId),
  });
}

/**
 * Daftar kontak dalam bentuk { [userId]: contact } untuk mencari status online dengan cepat.
 */
export function useContactsById() {
  const contactsQuery = useContactsQuery();
  const contacts = contactsQuery.data || EMPTY_LIST;

  return useMemo(() => indexContactsById(contacts), [contacts]);
}

export function useActiveConversation() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversationsQuery = useConversationsQuery();
  const conversations = conversationsQuery.data || EMPTY_LIST;

  return useMemo(() => {
    return conversations.find((conversation) => conversation.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);
}

/**
 * Membuka percakapan: menandainya aktif & menutup sidebar di layar kecil.
 */
export function useOpenConversation() {
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);

  return (conversationId) => {
    setActiveConversationId(conversationId);
    setMobileSidebarOpen(false);
  };
}

export function useCreateAiConversation() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const openConversation = useOpenConversation();
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const showToast = useChatStore((state) => state.showToast);

  return useMutation({
    mutationFn: () => ConversationApi.createAiConversation(token),
    onSuccess: (conversation) => {
      ChatCache.addConversation(queryClient, conversation);
      setActiveTab(SIDEBAR_TABS.assistant);
      openConversation(conversation.id);
    },
    onError: (error) => {
      showToast(error.message || 'Failed to create AI chat', 'error');
    },
  });
}

/**
 * Membuka chat langsung dengan user lain (dibuat di server jika belum ada).
 */
export function useOpenDirectConversation() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const openConversation = useOpenConversation();
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const showToast = useChatStore((state) => state.showToast);

  return useMutation({
    mutationFn: (userId) => ConversationApi.openDirectConversation(userId, token),
    onSuccess: (conversation) => {
      const conversations = queryClient.getQueryData(queryKeys.conversations) || [];
      const alreadyListed = conversations.some((item) => item.id === conversation.id);

      if (!alreadyListed) {
        ChatCache.addConversation(queryClient, conversation);
      }

      setActiveTab(SIDEBAR_TABS.direct);
      openConversation(conversation.id);
    },
    onError: (error) => {
      showToast(error.message || 'Failed to open chat', 'error');
    },
  });
}
