const AiProviderService = require('./AiProviderService');
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
    const prompt = AssistantService.buildPrompt(recentMessages);
    const chatMessages = AssistantService.buildChatMessages(recentMessages);

    let assistantMessage;

    try {
      const result = await AiProviderService.generate(prompt, chatMessages);

      assistantMessage = await MessageService.createAssistantMessage(conversationId, result.text, {
        provider: result.provider,
        model: result.model,
      });
    } catch (error) {
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
   * untuk provider kompatibel OpenAI.
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

  /**
   * Mengubah riwayat pesan menjadi prompt teks, contoh:
   *   User: Halo
   *   Assistant: Hai!
   *   Assistant:
   */
  static buildPrompt(messages) {
    const lines = messages.map((message) => {
      let speaker = 'Assistant';

      if (message.senderRole === 'user') {
        speaker = 'User';
      }

      return `${speaker}: ${message.content}`;
    });

    lines.push('Assistant:');

    return lines.join('\n');
  }
}

module.exports = AssistantService;
