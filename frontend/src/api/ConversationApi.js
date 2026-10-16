import ApiClient from './ApiClient';

class ConversationApi {
  static async getAll() {
    const data = await ApiClient.get('/api/conversations');
    return data.conversations || [];
  }

  static async getMessages(conversationId) {
    const data = await ApiClient.get(`/api/conversations/${conversationId}/messages`);
    return data.messages || [];
  }

  static async createAiConversation() {
    const body = {
      type: 'ai',
      title: 'AI Assistant',
      withAi: true,
    };

    const data = await ApiClient.post('/api/conversations', body);
    return data.conversation;
  }

  /**
   * Membuka (atau membuat) percakapan langsung dengan user lain.
   */
  static async openDirectConversation(userId) {
    const data = await ApiClient.post('/api/conversations/direct', { userId: userId });
    return data.conversation;
  }

  static async deleteMessage(conversationId, messageId) {
    await ApiClient.delete(`/api/conversations/${conversationId}/messages/${messageId}`);
  }

  static async deleteConversation(conversationId) {
    await ApiClient.delete(`/api/conversations/${conversationId}`);
  }
}

export default ConversationApi;
