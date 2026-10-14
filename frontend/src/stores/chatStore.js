import { create } from 'zustand';

const TOAST_DURATION_MS = 3500;

/**
 * State chat yang tidak berasal dari REST API:
 * percakapan aktif, status koneksi socket, indikator mengetik, dan toast.
 *
 * typingByConversation berbentuk:
 *   {
 *     [conversationId]: {
 *       assistant: true | false,
 *       userIds: { [userId]: true },
 *     }
 *   }
 */
export const useChatStore = create((set, get) => {
  return {
    activeConversationId: null,
    connectionStatus: 'disconnected',
    typingByConversation: {},
    toastMessage: null,
    toastVariant: 'info',

    setActiveConversationId: (conversationId) => {
      set({ activeConversationId: conversationId });
    },

    setConnectionStatus: (status) => {
      set({ connectionStatus: status });
    },

    setAssistantTyping: (conversationId, isTyping) => {
      const current = get().typingByConversation[conversationId] || { assistant: false, userIds: {} };

      set({
        typingByConversation: {
          ...get().typingByConversation,
          [conversationId]: { ...current, assistant: isTyping },
        },
      });
    },

    setUserTyping: (conversationId, userId, isTyping) => {
      const current = get().typingByConversation[conversationId] || { assistant: false, userIds: {} };
      const nextUserIds = { ...current.userIds };

      if (isTyping) {
        nextUserIds[userId] = true;
      } else {
        delete nextUserIds[userId];
      }

      set({
        typingByConversation: {
          ...get().typingByConversation,
          [conversationId]: { ...current, userIds: nextUserIds },
        },
      });
    },

    /**
     * variant: "info" | "success" | "warning" | "error"
     */
    showToast: (message, variant) => {
      set({ toastMessage: message, toastVariant: variant || 'info' });

      window.setTimeout(() => {
        if (get().toastMessage === message) {
          set({ toastMessage: null });
        }
      }, TOAST_DURATION_MS);
    },

    reset: () => {
      set({
        activeConversationId: null,
        connectionStatus: 'disconnected',
        typingByConversation: {},
        toastMessage: null,
      });
    },
  };
});

/**
 * Mengubah data mentah typingByConversation[id] menjadi { assistant: boolean, userIds: string[] }.
 *
 * Catatan: di komponen, ambil data mentahnya dulu dengan selector
 *   useChatStore((state) => state.typingByConversation[conversationId])
 * lalu panggil fungsi ini. Selector Zustand tidak boleh membuat object baru setiap render.
 */
export function toTypingInfo(typing) {
  if (!typing) {
    return { assistant: false, userIds: [] };
  }

  return {
    assistant: typing.assistant,
    userIds: Object.keys(typing.userIds),
  };
}
