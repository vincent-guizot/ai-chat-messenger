import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ConversationApi from '@/api/ConversationApi';
import UserApi from '@/api/UserApi';
import { queryKeys } from '@/lib/queryClient';
import ChatCache from '@/lib/chatCache';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { SIDEBAR_TABS, useUiStore } from '@/stores/uiStore';
import { indexContactsById } from '@/utils/conversations';

const EMPTY_LIST = [];

/**
 * Query hanya aktif saat user sudah login; token dikirim otomatis oleh ApiClient.
 */
function useIsLoggedIn() {
  const token = useAuthStore((state) => state.token);
  return Boolean(token);
}

export function useConversationsQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: ConversationApi.getAll,
    enabled: isLoggedIn,
  });
}

export function useContactsQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: UserApi.getContacts,
    enabled: isLoggedIn,
  });
}

export function useMessagesQuery(conversationId) {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => ConversationApi.getMessages(conversationId),
    enabled: isLoggedIn && Boolean(conversationId),
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
    const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
    return activeConversation || null;
  }, [conversations, activeConversationId]);
}

/**
 * Membuka percakapan: menandainya aktif & menutup sidebar di layar kecil.
 */
export function useOpenConversation() {
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);

  return function openConversation(conversationId) {
    setActiveConversationId(conversationId);
    setMobileSidebarOpen(false);
  };
}

export function useCreateAiConversation() {
  const queryClient = useQueryClient();
  const openConversation = useOpenConversation();
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  return useMutation({
    mutationFn: ConversationApi.createAiConversation,
    onSuccess: (conversation) => {
      ChatCache.addConversation(queryClient, conversation);
      setActiveTab(SIDEBAR_TABS.assistant);
      openConversation(conversation.id);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create AI chat');
    },
  });
}

/**
 * Membuka chat langsung dengan user lain (dibuat di server jika belum ada).
 */
export function useOpenDirectConversation() {
  const queryClient = useQueryClient();
  const openConversation = useOpenConversation();
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  return useMutation({
    mutationFn: (userId) => ConversationApi.openDirectConversation(userId),
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
      toast.error(error.message || 'Failed to open chat');
    },
  });
}

/**
 * Menghapus satu pesan. Tampilan diperbarui lewat event socket "message:deleted"
 * (juga untuk tab/perangkat lain), tapi cache langsung dibersihkan agar terasa instan.
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => ConversationApi.deleteMessage(variables.conversationId, variables.messageId),
    onSuccess: (data, variables) => {
      ChatCache.removeMessage(queryClient, variables.conversationId, variables.messageId);
      toast.success('Message deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete message');
    },
  });
}

/**
 * Menghapus percakapan. Jika yang dihapus sedang dibuka, tampilan kembali ke layar sambutan.
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

  return useMutation({
    mutationFn: (conversationId) => ConversationApi.deleteConversation(conversationId),
    onSuccess: (data, conversationId) => {
      ChatCache.removeConversation(queryClient, conversationId);

      const activeConversationId = useChatStore.getState().activeConversationId;
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }

      toast.success('Chat deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete chat');
    },
  });
}
