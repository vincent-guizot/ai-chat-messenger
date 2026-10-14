const TokenService = require('../services/TokenService');
const ConversationService = require('../services/ConversationService');
const MessageService = require('../services/MessageService');
const AssistantService = require('../services/AssistantService');
const PresenceService = require('../services/PresenceService');
const UserService = require('../services/UserService');

/**
 * Event Socket.IO yang didukung:
 *
 *   client -> server
 *     "join"            { conversationId }
 *     "leave"           { conversationId }
 *     "message:create"  { conversationId, content }
 *     "typing"          { conversationId, isTyping }
 *
 *   server -> client
 *     "message:new"       pesan baru (dikirim ke semua peserta percakapan)
 *     "typing"            { conversationId, userId, isTyping }
 *     "assistant:typing"  { conversationId, isTyping }
 *     "presence:update"   { userId, online, lastSeenAt }
 *     "error"             { message }
 *
 * Setiap socket yang login otomatis masuk ke room pribadi "user:<id>",
 * sehingga pesan DM tetap sampai walaupun percakapannya belum dibuka.
 */
class ChatSocket {
  static register(io) {
    io.use(ChatSocket.authenticate);

    io.on('connection', (socket) => {
      ChatSocket.handleConnection(io, socket);
    });
  }

  static userRoom(userId) {
    return `user:${userId}`;
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
    if (socket.user) {
      ChatSocket.handleUserOnline(io, socket);
    }

    socket.on('join', (payload) => {
      ChatSocket.handleJoin(socket, payload);
    });

    socket.on('leave', (payload) => {
      ChatSocket.handleLeave(socket, payload);
    });

    socket.on('message:create', (payload) => {
      ChatSocket.handleMessageCreate(io, socket, payload);
    });

    socket.on('typing', (payload) => {
      ChatSocket.handleTyping(io, socket, payload);
    });

    socket.on('disconnect', () => {
      if (socket.user) {
        ChatSocket.handleUserOffline(io, socket);
      }
    });
  }

  // --- Presence --------------------------------------------------------------

  static handleUserOnline(io, socket) {
    const userId = socket.user.id;

    socket.join(ChatSocket.userRoom(userId));

    const justCameOnline = PresenceService.addConnection(userId);

    if (justCameOnline) {
      io.emit('presence:update', {
        userId: userId,
        online: true,
        lastSeenAt: null,
      });
    }
  }

  static async handleUserOffline(io, socket) {
    const userId = socket.user.id;
    const wentOffline = PresenceService.removeConnection(userId);

    if (!wentOffline) {
      return;
    }

    try {
      const updatedUser = await UserService.updateLastSeen(userId);

      io.emit('presence:update', {
        userId: userId,
        online: false,
        lastSeenAt: updatedUser.lastSeenAt,
      });
    } catch (error) {
      console.error('failed to update lastSeenAt', error.message);
    }
  }

  // --- Rooms -----------------------------------------------------------------

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

  /**
   * Room tujuan untuk sebuah percakapan: room percakapan + room pribadi setiap peserta.
   * Socket.IO otomatis mencegah satu socket menerima event yang sama dua kali.
   */
  static async conversationAudience(conversationId) {
    const participantIds = await ConversationService.findHumanParticipantIds(conversationId);
    const rooms = participantIds.map(ChatSocket.userRoom);

    rooms.push(conversationId);

    return rooms;
  }

  // --- Typing ----------------------------------------------------------------

  static async handleTyping(io, socket, payload) {
    if (!socket.user || !payload || !payload.conversationId) {
      return;
    }

    const isParticipant = await ConversationService.isParticipant(payload.conversationId, socket.user.id);

    if (!isParticipant) {
      return;
    }

    const audience = await ChatSocket.conversationAudience(payload.conversationId);

    // Kirim ke semua peserta kecuali tab milik pengirim sendiri.
    socket.to(audience).except(ChatSocket.userRoom(socket.user.id)).emit('typing', {
      conversationId: payload.conversationId,
      userId: socket.user.id,
      isTyping: payload.isTyping === true,
    });
  }

  // --- Pesan -----------------------------------------------------------------

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

      const audience = await ChatSocket.conversationAudience(conversationId);

      const userMessage = await MessageService.createUserMessage(conversationId, socket.user.id, content);
      await ConversationService.touch(conversationId);
      io.to(audience).emit('message:new', userMessage);

      await ChatSocket.replyWithAssistant(io, audience, conversationId);
    } catch (error) {
      console.error('message:create error', error);
      socket.emit('error', { message: error.message || 'server error' });
    }
  }

  static async replyWithAssistant(io, audience, conversationId) {
    const hasAssistant = await ConversationService.hasAssistant(conversationId);

    if (!hasAssistant) {
      return;
    }

    io.to(audience).emit('assistant:typing', { conversationId: conversationId, isTyping: true });

    try {
      const assistantMessage = await AssistantService.replyToConversation(conversationId);

      if (assistantMessage) {
        io.to(audience).emit('message:new', assistantMessage);
      }
    } finally {
      io.to(audience).emit('assistant:typing', { conversationId: conversationId, isTyping: false });
    }
  }
}

module.exports = ChatSocket;
