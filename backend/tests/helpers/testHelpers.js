const request = require('supertest');
const prisma = require('../../prisma/prisma');
const app = require('../../src/app');

class TestHelpers {
  /**
   * Mengosongkan semua tabel (urutan penting karena foreign key).
   */
  static async resetDatabase() {
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();
  }

  static async disconnect() {
    await prisma.$disconnect();
  }

  static async signupUser(email, password, name) {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: email, password: password, name: name });

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.token).toBeDefined();

    return response.body;
  }
}

module.exports = TestHelpers;
