const ConversationService = require('../services/ConversationService');
const MessageService = require('../services/MessageService');
const UserService = require('../services/UserService');
const HttpError = require('../utils/HttpError');
const ChatSocket = require('../sockets/ChatSocket');
const NotificationService = require('../services/NotificationService');

class ConversationController {
  /**
   * GET /api/conversations
   */
  static async index(request, response, next) {
    try {
      const conversations = await ConversationService.findAllForUser(request.user.id);

      return response.json({ ok: true, conversations: conversations });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/conversations
   * Body: { type?, title?, participantIds?, withAi? }
   */
  static async store(request, response, next) {
    try {
      const body = request.body;

      let participantIds = [];
      if (body.participantIds !== undefined) {
        participantIds = body.participantIds;
      }

      if (!Array.isArray(participantIds)) {
        throw HttpError.badRequest('participantIds must be an array');
      }

      let type = 'dm';
      if (body.type) {
        type = body.type;
      }

      let title = 'New chat';
      if (body.title) {
        title = body.title;
      }

      const conversation = await ConversationService.createConversation({
        creatorId: request.user.id,
        type: type,
        title: title,
        participantIds: participantIds,
        withAi: body.withAi === true,
      });

      return response.json({ ok: true, conversation: conversation });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/conversations/direct
   * Body: { userId }
   * Membuka percakapan langsung dengan user lain (dibuat jika belum ada).
   */
  static async direct(request, response, next) {
    try {
      const currentUserId = request.user.id;
      const otherUserId = request.body.userId;

      if (!otherUserId) {
        throw HttpError.badRequest('userId required');
      }

      if (otherUserId === currentUserId) {
        throw HttpError.badRequest('cannot start a chat with yourself');
      }

      const otherUser = await UserService.findById(otherUserId);

      if (!otherUser || otherUser.email === UserService.ASSISTANT_EMAIL) {
        throw HttpError.notFound('user not found');
      }

      const result = await ConversationService.findOrCreateDirect(currentUserId, otherUserId);

      return response.json({
        ok: true,
        conversation: result.conversation,
        isNew: result.isNew,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/conversations/:id/messages
   */
  static async messages(request, response, next) {
    try {
      const conversationId = request.params.id;
      const isParticipant = await ConversationService.isParticipant(conversationId, request.user.id);

      if (!isParticipant) {
        throw HttpError.forbidden('not allowed');
      }

      const messages = await MessageService.findAllInConversation(conversationId);

      return response.json({ ok: true, messages: messages });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/conversations/:id/messages/:messageId
   * Pengirim boleh menghapus pesannya sendiri. Di chat AI, pemilik chat juga boleh
   * menghapus balasan AI. Semua peserta menerima event "message:deleted".
   */
  static async destroyMessage(request, response, next) {
    try {
      const conversationId = request.params.id;
      const messageId = request.params.messageId;
      const userId = request.user.id;

      const isParticipant = await ConversationService.isParticipant(conversationId, userId);

      if (!isParticipant) {
        throw HttpError.forbidden('not allowed');
      }

      const message = await MessageService.findById(messageId);

      if (!message || message.conversationId !== conversationId) {
        throw HttpError.notFound('message not found');
      }

      const isOwnMessage = message.senderRole === 'user' && message.senderId === userId;
      let canDelete = isOwnMessage;

      if (!canDelete && message.senderRole === 'assistant') {
        const hasAssistant = await ConversationService.hasAssistant(conversationId);
        canDelete = hasAssistant;
      }

      if (!canDelete) {
        throw HttpError.forbidden('you can only delete your own messages');
      }

      const participantIds = await ConversationService.findHumanParticipantIds(conversationId);

      await MessageService.deleteById(messageId);
      await NotificationService.deleteForMessage(messageId);

      const io = request.app.get('io');
      if (io) {
        io.to(ChatSocket.roomsFor(conversationId, participantIds)).emit('message:deleted', {
          conversationId: conversationId,
          messageId: messageId,
        });
      }

      return response.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/conversations/:id
   * Chat AI dihapus total. Pada DM, user hanya keluar dari percakapan (lawan bicara tetap
   * memiliki riwayatnya); jika tidak ada manusia yang tersisa, percakapan dihapus.
   */
  static async destroy(request, response, next) {
    try {
      const conversationId = request.params.id;
      const userId = request.user.id;

      const isParticipant = await ConversationService.isParticipant(conversationId, userId);

      if (!isParticipant) {
        throw HttpError.forbidden('not allowed');
      }

      const hasAssistant = await ConversationService.hasAssistant(conversationId);
      const participantIds = await ConversationService.findHumanParticipantIds(conversationId);
      const io = request.app.get('io');

      if (hasAssistant || participantIds.length <= 1) {
        await ConversationService.deleteConversation(conversationId);

        if (io) {
          io.to(ChatSocket.roomsFor(conversationId, participantIds)).emit('conversation:deleted', {
            conversationId: conversationId,
          });
        }
      } else {
        await ConversationService.removeParticipant(conversationId, userId);

        if (io) {
          io.to(ChatSocket.userRoom(userId)).emit('conversation:deleted', { conversationId: conversationId });
        }
      }

      return response.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ConversationController;
