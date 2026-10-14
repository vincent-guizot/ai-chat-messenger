const ConversationService = require('../services/ConversationService');
const MessageService = require('../services/MessageService');
const HttpError = require('../utils/HttpError');

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
}

module.exports = ConversationController;
