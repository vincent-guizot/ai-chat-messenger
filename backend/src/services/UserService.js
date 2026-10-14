const bcrypt = require('bcrypt');
const prisma = require('../config/database');

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

  /**
   * Hanya mengembalikan field yang aman dikirim ke client (tanpa passwordHash).
   */
  static toPublicUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

UserService.ASSISTANT_EMAIL = ASSISTANT_EMAIL;

module.exports = UserService;
