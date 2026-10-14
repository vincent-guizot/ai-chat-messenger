const prisma = require('../../prisma/prisma');

const DEFAULT_LIST_LIMIT = 30;
const MESSAGE_PREVIEW_LENGTH = 120;

const NOTIFICATION_TYPES = {
  message: 'message',
  system: 'system',
};

// Data pengirim yang ikut dikirim ke client (tanpa passwordHash).
const ACTOR_FIELDS = {
  select: {
    id: true,
    name: true,
    email: true,
  },
};

class NotificationService {
  /**
   * Notifikasi milik user, dari yang terbaru.
   */
  static async findForUser(userId, limit) {
    return prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit || DEFAULT_LIST_LIMIT,
      include: { actor: ACTOR_FIELDS },
    });
  }

  static async countUnread(userId) {
    return prisma.notification.count({
      where: {
        userId: userId,
        readAt: null,
      },
    });
  }

  static async create(options) {
    return prisma.notification.create({
      data: {
        userId: options.userId,
        type: options.type || NOTIFICATION_TYPES.system,
        title: options.title,
        body: options.body || null,
        actorId: options.actorId || null,
        conversationId: options.conversationId || null,
        data: options.data || undefined,
      },
      include: { actor: ACTOR_FIELDS },
    });
  }

  /**
   * Membuat notifikasi "pesan baru" untuk setiap penerima pesan (selain pengirim).
   * Mengembalikan daftar notifikasi yang dibuat, agar bisa dikirim lewat socket.
   */
  static async createForNewMessage(message, sender, recipientIds) {
    let senderName = 'Someone';
    if (sender && sender.name) {
      senderName = sender.name;
    }

    const createdNotifications = [];

    for (const recipientId of recipientIds) {
      if (recipientId === message.senderId) {
        continue;
      }

      const notification = await NotificationService.create({
        userId: recipientId,
        type: NOTIFICATION_TYPES.message,
        title: `New message from ${senderName}`,
        body: NotificationService.toPreview(message.content),
        actorId: message.senderId,
        conversationId: message.conversationId,
        data: { messageId: message.id },
      });

      createdNotifications.push(notification);
    }

    return createdNotifications;
  }

  /**
   * Menandai satu notifikasi sebagai sudah dibaca.
   * Mengembalikan null jika notifikasi tidak ditemukan / bukan milik user.
   */
  static async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      return null;
    }

    if (notification.readAt) {
      return notification;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  /**
   * Menandai semua notifikasi belum dibaca sebagai sudah dibaca.
   * Jika conversationId diisi, hanya notifikasi dari percakapan tersebut.
   * Mengembalikan jumlah notifikasi yang diubah.
   */
  static async markAllAsRead(userId, conversationId) {
    const where = {
      userId: userId,
      readAt: null,
    };

    if (conversationId) {
      where.conversationId = conversationId;
    }

    const result = await prisma.notification.updateMany({
      where: where,
      data: { readAt: new Date() },
    });

    return result.count;
  }

  static toPreview(text) {
    const singleLine = String(text || '').replace(/\s+/g, ' ').trim();

    if (singleLine.length <= MESSAGE_PREVIEW_LENGTH) {
      return singleLine;
    }

    return `${singleLine.slice(0, MESSAGE_PREVIEW_LENGTH - 1)}…`;
  }
}

NotificationService.TYPES = NOTIFICATION_TYPES;

module.exports = NotificationService;
