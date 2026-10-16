const AiChatClient = require('./AiChatClient');
const ConversationService = require('./ConversationService');
const MessageService = require('./MessageService');

const HISTORY_MESSAGE_LIMIT = 10;

class AssistantService {
  /**
   * Membuat balasan AI untuk sebuah percakapan.
   * Mengembalikan pesan assistant yang sudah disimpan,
   * atau null jika percakapan tersebut tidak memiliki AI Assistant.
   */
  static async replyToConversation(conversationId) {
    const hasAssistant = await ConversationService.hasAssistant(conversationId);

    if (!hasAssistant) {
      return null;
    }

    const recentMessages = await MessageService.findRecentInConversation(conversationId, HISTORY_MESSAGE_LIMIT);
    const chatMessages = AssistantService.buildChatMessages(recentMessages);

    let assistantMessage;

    try {
      const result = await AiChatClient.reply(chatMessages);

      assistantMessage = await MessageService.createAssistantMessage(conversationId, result.text, {
        provider: result.provider,
        model: result.model,
      });
    } catch (error) {
      // Kegagalan AI tetap disimpan sebagai pesan assistant agar user tahu apa yang terjadi.
      const errorText = error.message || 'generation failed';

      assistantMessage = await MessageService.createAssistantMessage(conversationId, `AI error: ${errorText}`, {
        error: true,
      });
    }

    await ConversationService.touch(conversationId);

    return assistantMessage;
  }

  /**
   * Mengubah riwayat pesan menjadi format chat [{ role, content }]
   * yang dikirim ke service AI.
   */
  static buildChatMessages(messages) {
    return messages.map((message) => {
      let role = 'assistant';

      if (message.senderRole === 'user') {
        role = 'user';
      }

      return { role: role, content: message.content };
    });
  }
}

module.exports = AssistantService;
