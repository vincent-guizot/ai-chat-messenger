/**
 * "Budi Santoso" -> "BS", nama kosong -> fallback.
 */
export function getInitials(name, fallback) {
  if (!name) {
    return fallback;
  }

  const words = name.trim().split(' ').slice(0, 2);
  const firstLetters = words.map((word) => word.charAt(0));

  return firstLetters.join('').toUpperCase();
}

/**
 * Dua huruf pertama dari judul percakapan, contoh "AI Assistant" -> "AI".
 */
export function getConversationBadge(conversation) {
  const title = conversation.title || 'AI';
  return title.slice(0, 2).toUpperCase();
}

export function formatTime(dateValue) {
  let date = new Date();

  if (dateValue) {
    date = new Date(dateValue);
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function conversationHasAssistant(conversation) {
  if (!conversation) {
    return false;
  }

  if (conversation.participants) {
    return conversation.participants.some((participant) => participant.role === 'assistant');
  }

  return conversation.type === 'ai';
}
