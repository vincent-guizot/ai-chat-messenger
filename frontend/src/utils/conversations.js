/**
 * Helper untuk menampilkan percakapan di sidebar & header chat.
 */

export function isAssistantConversation(conversation) {
  if (!conversation) {
    return false;
  }

  if (conversation.participants) {
    return conversation.participants.some((participant) => participant.role === 'assistant');
  }

  return conversation.type === 'ai';
}

export function isDirectConversation(conversation) {
  return Boolean(conversation) && !isAssistantConversation(conversation);
}

/**
 * Lawan bicara di percakapan langsung (peserta selain user yang sedang login).
 * Status online diambil dari daftar kontak, karena data itu yang diperbarui secara real-time.
 */
export function findOtherUser(conversation, currentUserId, contactsById) {
  if (!conversation || !conversation.participants) {
    return null;
  }

  const otherParticipant = conversation.participants.find((participant) => {
    return participant.userId !== currentUserId && participant.role !== 'assistant';
  });

  if (!otherParticipant) {
    return null;
  }

  const liveContact = contactsById[otherParticipant.userId];

  if (liveContact) {
    return liveContact;
  }

  return otherParticipant.user;
}

export function getConversationTitle(conversation, otherUser) {
  if (isAssistantConversation(conversation)) {
    return conversation.title || 'AI Assistant';
  }

  if (otherUser && otherUser.name) {
    return otherUser.name;
  }

  return conversation.title || 'Conversation';
}

export function getLastMessage(conversation) {
  if (!conversation || !conversation.messages || conversation.messages.length === 0) {
    return null;
  }

  return conversation.messages[0];
}

/**
 * Mengubah array kontak menjadi object { [id]: contact } agar mudah dicari.
 */
export function indexContactsById(contacts) {
  const contactsById = {};

  for (const contact of contacts) {
    contactsById[contact.id] = contact;
  }

  return contactsById;
}
