const prisma = require('../config/database');
const UserService = require('./UserService');
const MessageService = require('./MessageService');

const ASSISTANT_GREETING = 'Halo! Saya AI Assistant. Ada yang bisa saya bantu?';

class ConversationService {
  /**
   * Semua percakapan yang diikuti oleh user, diurutkan dari yang terbaru.
   * Setiap percakapan menyertakan peserta dan pesan terakhirnya.
   */
  static async findAllForUser(userId) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return conversations.map(ConversationService.removePrivateUserFields);
  }

  static async createConversation(options) {
    const memberRows = [
      { userId: options.creatorId, role: 'member' },
    ];

    for (const participantId of options.participantIds) {
      if (participantId !== options.creatorId) {
        memberRows.push({ userId: participantId, role: 'member' });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: options.type,
        title: options.title,
        createdById: options.creatorId,
        participants: {
          create: memberRows,
        },
      },
    });

    if (options.withAi) {
      await ConversationService.addAssistant(conversation.id);
    }

    return ConversationService.findById(conversation.id);
  }

  static async findById(conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    return ConversationService.removePrivateUserFields(conversation);
  }

  /**
   * Menambahkan AI Assistant sebagai peserta lalu mengirim pesan sapaan pertama.
   */
  static async addAssistant(conversationId) {
    const assistant = await UserService.findOrCreateAssistant();

    await prisma.participant.create({
      data: {
        conversationId: conversationId,
        userId: assistant.id,
        role: 'assistant',
      },
    });

    await MessageService.createAssistantMessage(conversationId, ASSISTANT_GREETING, {
      provider: 'assistant',
      model: 'system',
    });
  }

  static async isParticipant(conversationId, userId) {
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId,
      },
    });

    return participant !== null;
  }

  static async hasAssistant(conversationId) {
    const assistantParticipant = await prisma.participant.findFirst({
      where: {
        conversationId: conversationId,
        role: 'assistant',
      },
    });

    return assistantParticipant !== null;
  }

  /**
   * Memperbarui updatedAt agar percakapan naik ke urutan teratas di daftar.
   */
  static async touch(conversationId) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Menghapus passwordHash dari data user peserta sebelum dikirim ke client.
   */
  static removePrivateUserFields(conversation) {
    const safeParticipants = conversation.participants.map((participant) => {
      return {
        ...participant,
        user: UserService.toPublicUser(participant.user),
      };
    });

    return {
      ...conversation,
      participants: safeParticipants,
    };
  }
}

module.exports = ConversationService;
