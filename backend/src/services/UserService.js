const bcrypt = require('bcrypt');
const prisma = require('../../prisma/prisma');
const PresenceService = require('./PresenceService');

const PASSWORD_SALT_ROUNDS = 10;
const ASSISTANT_EMAIL = 'assistant@ai-chat.local';
const ASSISTANT_NAME = 'AI Assistant';

class UserService {
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email },
    });
  }

  static async createUser(email, password, name) {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    return prisma.user.create({
      data: {
        email: email,
        name: name,
        passwordHash: passwordHash,
      },
    });
  }

  static async isPasswordCorrect(user, plainPassword) {
    return bcrypt.compare(plainPassword, user.passwordHash);
  }

  /**
   * Mengambil user "AI Assistant". Jika belum ada, user tersebut dibuat terlebih dahulu.
   */
  static async findOrCreateAssistant() {
    const existingAssistant = await UserService.findByEmail(ASSISTANT_EMAIL);

    if (existingAssistant) {
      return existingAssistant;
    }

    return prisma.user.create({
      data: {
        email: ASSISTANT_EMAIL,
        name: ASSISTANT_NAME,
        passwordHash: 'ai-bot-placeholder',
      },
    });
  }

  static async findById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Semua user selain user yang sedang login dan AI Assistant,
   * lengkap dengan status online. User yang online ditaruh paling atas.
   */
  static async findContacts(currentUserId) {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        email: { not: ASSISTANT_EMAIL },
      },
      orderBy: { name: 'asc' },
    });

    const contacts = users.map(UserService.toPublicUser);

    const onlineContacts = contacts.filter((contact) => contact.online);
    const offlineContacts = contacts.filter((contact) => !contact.online);

    return onlineContacts.concat(offlineContacts);
  }

  static async updateLastSeen(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  /**
   * Hanya mengembalikan field yang aman dikirim ke client (tanpa passwordHash),
   * ditambah status online dari PresenceService.
   */
  static toPublicUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      lastSeenAt: user.lastSeenAt,
      online: PresenceService.isOnline(user.id),
    };
  }
}

UserService.ASSISTANT_EMAIL = ASSISTANT_EMAIL;

module.exports = UserService;
