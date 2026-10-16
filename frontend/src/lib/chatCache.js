import { queryKeys } from './queryClient';

export const TEMPORARY_ID_PREFIX = 'tmp-';

/**
 * Fungsi-fungsi untuk memperbarui cache React Query ketika event socket datang,
 * sehingga tampilan langsung berubah tanpa perlu memanggil API lagi.
 */
class ChatCache {
  /**
   * Menambahkan pesan baru ke daftar pesan percakapan:
   * - diabaikan jika id-nya sudah ada,
   * - jika itu pesan milik user sendiri, pesan sementara (optimistic) yang isinya sama diganti,
   * - selain itu ditambahkan di akhir.
   */
  static addMessage(queryClient, message, currentUserId) {
    const key = queryKeys.messages(message.conversationId);

    queryClient.setQueryData(key, (previousMessages) => {
      if (!previousMessages) {
        return previousMessages;
      }

      const alreadyExists = previousMessages.some((existing) => existing.id === message.id);

      if (alreadyExists) {
        return previousMessages;
      }

      const isOwnMessage = message.senderRole === 'user' && message.senderId === currentUserId;

      if (isOwnMessage) {
        const temporaryIndex = previousMessages.findIndex((existing) => {
          const isTemporary = String(existing.id).startsWith(TEMPORARY_ID_PREFIX);
          return isTemporary && existing.content === message.content;
        });

        if (temporaryIndex !== -1) {
          const updatedMessages = [...previousMessages];
          updatedMessages[temporaryIndex] = message;
          return updatedMessages;
        }
      }

      return [...previousMessages, message];
    });
  }

  static addTemporaryMessage(queryClient, conversationId, senderId, content) {
    const temporaryMessage = {
      id: `${TEMPORARY_ID_PREFIX}${Date.now()}`,
      conversationId: conversationId,
      senderId: senderId,
      senderRole: 'user',
      content: content,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(queryKeys.messages(conversationId), (previousMessages) => {
      if (!previousMessages) {
        return [temporaryMessage];
      }

      return [...previousMessages, temporaryMessage];
    });
  }

  /**
   * Menaruh percakapan ke urutan teratas dan menyimpan pesan terakhirnya.
   * Mengembalikan false jika percakapan belum ada di cache (mis. DM baru dari orang lain).
   */
  static moveConversationToTop(queryClient, message) {
    const conversations = queryClient.getQueryData(queryKeys.conversations);

    if (!conversations) {
      return false;
    }

    const conversation = conversations.find((item) => item.id === message.conversationId);

    if (!conversation) {
      return false;
    }

    const updatedConversation = {
      ...conversation,
      updatedAt: message.createdAt,
      messages: [message],
    };

    const otherConversations = conversations.filter((item) => item.id !== message.conversationId);

    queryClient.setQueryData(queryKeys.conversations, [updatedConversation, ...otherConversations]);

    return true;
  }

  /**
   * Membuang satu pesan dari daftar pesan, lalu memperbarui pratinjau "pesan terakhir" di sidebar.
   * Mengembalikan false jika daftar pesan percakapan itu belum pernah dimuat (perlu ambil ulang).
   */
  static removeMessage(queryClient, conversationId, messageId) {
    const messages = queryClient.getQueryData(queryKeys.messages(conversationId));
    const conversations = queryClient.getQueryData(queryKeys.conversations);

    if (messages) {
      const remainingMessages = messages.filter((message) => message.id !== messageId);
      queryClient.setQueryData(queryKeys.messages(conversationId), remainingMessages);

      if (conversations) {
        const lastMessage = remainingMessages[remainingMessages.length - 1];
        let lastMessages = [];
        if (lastMessage) {
          lastMessages = [lastMessage];
        }

        queryClient.setQueryData(
          queryKeys.conversations,
          conversations.map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }

            return { ...conversation, messages: lastMessages };
          }),
        );
      }

      return true;
    }

    return false;
  }

  static removeConversation(queryClient, conversationId) {
    queryClient.setQueryData(queryKeys.conversations, (previousConversations) => {
      if (!previousConversations) {
        return previousConversations;
      }

      return previousConversations.filter((item) => item.id !== conversationId);
    });

    queryClient.removeQueries({ queryKey: queryKeys.messages(conversationId) });
  }

  static addConversation(queryClient, conversation) {
    queryClient.setQueryData(queryKeys.conversations, (previousConversations) => {
      const list = previousConversations || [];
      const withoutDuplicate = list.filter((item) => item.id !== conversation.id);

      return [conversation, ...withoutDuplicate];
    });
  }

  static updateContactPresence(queryClient, presence) {
    queryClient.setQueryData(queryKeys.contacts, (previousContacts) => {
      if (!previousContacts) {
        return previousContacts;
      }

      return previousContacts.map((contact) => {
        if (contact.id !== presence.userId) {
          return contact;
        }

        let lastSeenAt = contact.lastSeenAt;
        if (presence.lastSeenAt) {
          lastSeenAt = presence.lastSeenAt;
        }

        return { ...contact, online: presence.online, lastSeenAt: lastSeenAt };
      });
    });
  }
}

export default ChatCache;
