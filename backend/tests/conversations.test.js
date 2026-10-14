const request = require('supertest');
const app = require('../src/app');
const TestHelpers = require('./helpers/testHelpers');

beforeAll(async () => {
  await TestHelpers.resetDatabase();
});

afterAll(async () => {
  await TestHelpers.disconnect();
});

describe('Conversation API', () => {
  test('user can create a conversation and fetch its messages', async () => {
    const alice = await TestHelpers.signupUser('alice@example.com', 'password123', 'Alice');
    const bob = await TestHelpers.signupUser('bob@example.com', 'password123', 'Bob');

    const createResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({
        type: 'dm',
        title: 'Alice & Bob',
        participantIds: [bob.user.id],
      });

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body.ok).toBe(true);
    expect(createResponse.body.conversation.participants).toHaveLength(2);

    const conversationId = createResponse.body.conversation.id;

    const listResponse = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${alice.token}`);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.ok).toBe(true);
    expect(listResponse.body.conversations).toHaveLength(1);

    const messagesResponse = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${alice.token}`);

    expect(messagesResponse.statusCode).toBe(200);
    expect(messagesResponse.body.ok).toBe(true);
    expect(Array.isArray(messagesResponse.body.messages)).toBe(true);
  });

  test('AI conversation starts with an assistant greeting', async () => {
    const carol = await TestHelpers.signupUser('carol@example.com', 'password123', 'Carol');

    const createResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${carol.token}`)
      .send({ type: 'ai', title: 'AI Assistant', withAi: true });

    expect(createResponse.statusCode).toBe(200);

    const conversationId = createResponse.body.conversation.id;

    const messagesResponse = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${carol.token}`);

    expect(messagesResponse.body.messages).toHaveLength(1);
    expect(messagesResponse.body.messages[0].senderRole).toBe('assistant');
  });

  test('non-participant cannot read messages', async () => {
    const owner = await TestHelpers.signupUser('owner@example.com', 'password123', 'Owner');
    const stranger = await TestHelpers.signupUser('stranger@example.com', 'password123', 'Stranger');

    const createResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Private' });

    const conversationId = createResponse.body.conversation.id;

    const messagesResponse = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${stranger.token}`);

    expect(messagesResponse.statusCode).toBe(403);
  });

  test('request without token is rejected', async () => {
    const response = await request(app).get('/api/conversations');

    expect(response.statusCode).toBe(401);
  });
});
