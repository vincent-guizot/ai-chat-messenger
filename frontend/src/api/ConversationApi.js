import ApiClient from './ApiClient';

class ConversationApi {
  static async getAll(token) {
    const data = await ApiClient.get('/api/conversations', token);
    return data.conversations || [];
  }

  static async getMessages(conversationId, token) {
    const data = await ApiClient.get(`/api/conversations/${conversationId}/messages`, token);
    return data.messages || [];
  }

  static async createAiConversation(token) {
    const body = {
      type: 'ai',
      title: 'AI Assistant',
      withAi: true,
    };

    const data = await ApiClient.post('/api/conversations', body, token);
    return data.conversation;
  }

  static async deleteMessage(conversationId, messageId, token) {
    await ApiClient.delete(`/api/conversations/${conversationId}/messages/${messageId}`, token);
  }

  static async deleteConversation(conversationId, token) {
    await ApiClient.delete(`/api/conversations/${conversationId}`, token);
  }

  /**
   * Membuka (atau membuat) percakapan langsung dengan user lain.
   */
  static async openDirectConversation(userId, token) {
    const data = await ApiClient.post('/api/conversations/direct', { userId: userId }, token);
    return data.conversation;
  }
}

export default ConversationApi;
