const prisma = require("../../prisma/prisma");

class MessageService {
  static async findAllInConversation(conversationId) {
    return prisma.message.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Mengambil beberapa pesan terakhir, diurutkan dari yang paling lama ke yang paling baru.
   */
  static async findRecentInConversation(conversationId, limit) {
    const newestFirst = await prisma.message.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return newestFirst.reverse();
  }

  static async findById(messageId) {
    return prisma.message.findUnique({ where: { id: messageId } });
  }

  static async deleteById(messageId) {
    return prisma.message.delete({ where: { id: messageId } });
  }

  static async createUserMessage(conversationId, senderId, content) {
    return prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: senderId,
        senderRole: "user",
        content: content,
      },
    });
  }

  static async createAssistantMessage(conversationId, content, metadata) {
    return prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: null,
        senderRole: "assistant",
        content: content,
        metadata: metadata,
      },
    });
  }
}

module.exports = MessageService;
