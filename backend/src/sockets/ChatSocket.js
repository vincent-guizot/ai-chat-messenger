const TokenService = require('../services/TokenService');
const ConversationService = require('../services/ConversationService');
const MessageService = require('../services/MessageService');
const AssistantService = require('../services/AssistantService');

/**
 * Event Socket.IO yang didukung:
 *   client -> server : "join", "leave", "message:create"
 *   server -> client : "message:new", "error"
 */
class ChatSocket {
  static register(io) {
    io.use(ChatSocket.authenticate);

    io.on('connection', (socket) => {
      ChatSocket.handleConnection(io, socket);
    });
  }

  /**
   * Membaca token dari socket.handshake.auth.token.
   * Koneksi tanpa token tetap diterima, tetapi tidak bisa mengirim pesan.
   */
  static authenticate(socket, next) {
    const handshakeAuth = socket.handshake.auth || {};
    const token = handshakeAuth.token;

    if (!token) {
      return next();
    }

    try {
      socket.user = TokenService.verifyToken(token);
    } catch (error) {
      console.log('socket auth failed:', error.message);
    }

    return next();
  }

  static handleConnection(io, socket) {
    socket.on('join', (payload) => {
      ChatSocket.handleJoin(socket, payload);
    });

    socket.on('leave', (payload) => {
      ChatSocket.handleLeave(socket, payload);
    });

    socket.on('message:create', (payload) => {
      ChatSocket.handleMessageCreate(io, socket, payload);
    });
  }

  static async handleJoin(socket, payload) {
    if (!payload || !payload.conversationId || !socket.user) {
      return;
    }

    const isParticipant = await ConversationService.isParticipant(payload.conversationId, socket.user.id);

    if (isParticipant) {
      socket.join(payload.conversationId);
    }
  }

  static handleLeave(socket, payload) {
    if (!payload || !payload.conversationId) {
      return;
    }

    socket.leave(payload.conversationId);
  }

  static async handleMessageCreate(io, socket, payload) {
    try {
      if (!socket.user) {
        socket.emit('error', { message: 'unauthenticated' });
        return;
      }

      if (!payload || !payload.conversationId || !payload.content) {
        return;
      }

      const conversationId = payload.conversationId;
      const content = String(payload.content).trim();

      if (content === '') {
        return;
      }

      const isParticipant = await ConversationService.isParticipant(conversationId, socket.user.id);

      if (!isParticipant) {
        socket.emit('error', { message: 'not a member of this conversation' });
        return;
      }

      const userMessage = await MessageService.createUserMessage(conversationId, socket.user.id, content);
      await ConversationService.touch(conversationId);
      io.to(conversationId).emit('message:new', userMessage);

      const assistantMessage = await AssistantService.replyToConversation(conversationId);

      if (assistantMessage) {
        io.to(conversationId).emit('message:new', assistantMessage);
      }
    } catch (error) {
      console.error('message:create error', error);
      socket.emit('error', { message: error.message || 'server error' });
    }
  }
}

module.exports = ChatSocket;
