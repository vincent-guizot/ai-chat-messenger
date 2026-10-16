import { create } from 'zustand';

/**
 * State chat yang tidak berasal dari REST API:
 * percakapan aktif, status koneksi socket, dan indikator mengetik.
 * (Toast memakai sonner, lihat components/ui/sonner.jsx.)
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

    reset: () => {
      set({
        activeConversationId: null,
        connectionStatus: 'disconnected',
        typingByConversation: {},
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
