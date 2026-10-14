const request = require('supertest');
const { sequelize } = require('../models');
const { app } = require('../index');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

async function signupUser(email, password, name = 'User') {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ email, password, name });

  expect(response.statusCode).toBe(200);
  return response.body;
}

describe('Conversation API', () => {
  test('user can create a conversation and fetch its messages', async () => {
    const firstUser = await signupUser('alice@example.com', 'password123', 'Alice');
    const secondUser = await signupUser('bob@example.com', 'password123', 'Bob');

    const createRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${firstUser.token}`)
      .send({
        type: 'dm',
        title: 'Alice & Bob',
        participantIds: [secondUser.user.id],
      });

    expect(createRes.statusCode).toBe(200);
    expect(createRes.body.ok).toBe(true);
    expect(createRes.body.conversation).toBeDefined();

    const conversationId = createRes.body.conversation.id;

    const listRes = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.ok).toBe(true);
    expect(Array.isArray(listRes.body.conversations)).toBe(true);

    const messagesRes = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${firstUser.token}`);

    expect(messagesRes.statusCode).toBe(200);
    expect(messagesRes.body.ok).toBe(true);
    expect(Array.isArray(messagesRes.body.messages)).toBe(true);
  }, 20000);
});
