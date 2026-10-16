const request = require('supertest');
const app = require('../src/app');
const UserService = require('../src/services/UserService');
const TestHelpers = require('./helpers/testHelpers');

beforeAll(async () => {
  await TestHelpers.resetDatabase();
});

afterAll(async () => {
  await TestHelpers.disconnect();
});

function authed(token) {
  return { Authorization: `Bearer ${token}` };
}

describe('POST /api/conversations', () => {
  let alice;
  let bob;

  beforeAll(async () => {
    alice = await TestHelpers.signupUser('conv-alice@example.com', 'password123', 'Alice');
    bob = await TestHelpers.signupUser('conv-bob@example.com', 'password123', 'Bob');
  });

  test('applies defaults: type "dm", title "New chat", creator as the only participant', async () => {
    const response = await request(app).post('/api/conversations').set(authed(alice.token)).send({});

    expect(response.statusCode).toBe(200);
    expect(response.body.conversation.type).toBe('dm');
    expect(response.body.conversation.title).toBe('New chat');
    expect(response.body.conversation.createdById).toBe(alice.user.id);
    expect(response.body.conversation.participants).toHaveLength(1);
    expect(response.body.conversation.participants[0].userId).toBe(alice.user.id);
  });

  test('rejects participantIds that is not an array', async () => {
    const response = await request(app)
      .post('/api/conversations')
      .set(authed(alice.token))
      .send({ participantIds: 'not-an-array' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ ok: false, error: 'participantIds must be an array' });
  });

  test('does not add the creator twice when listed in participantIds', async () => {
    const response = await request(app)
      .post('/api/conversations')
      .set(authed(alice.token))
      .send({ participantIds: [alice.user.id, bob.user.id] });

    expect(response.statusCode).toBe(200);
    expect(response.body.conversation.participants).toHaveLength(2);
  });

  test('never exposes password hashes of participants', async () => {
    const response = await request(app)
      .post('/api/conversations')
      .set(authed(alice.token))
      .send({ participantIds: [bob.user.id] });

    for (const participant of response.body.conversation.participants) {
      expect(participant.user.passwordHash).toBeUndefined();
    }
  });

  test('withAi adds the assistant as a participant with the "assistant" role', async () => {
    const response = await request(app)
      .post('/api/conversations')
      .set(authed(alice.token))
      .send({ type: 'ai', title: 'AI Room', withAi: true });

    const roles = response.body.conversation.participants.map((participant) => participant.role);
    expect(roles).toEqual(expect.arrayContaining(['member', 'assistant']));

    const assistantParticipant = response.body.conversation.participants.find(
      (participant) => participant.role === 'assistant'
    );
    expect(assistantParticipant.user.email).toBe(UserService.ASSISTANT_EMAIL);
  });

  test('withAi is ignored unless it is exactly true', async () => {
    const response = await request(app)
      .post('/api/conversations')
      .set(authed(alice.token))
      .send({ withAi: 'true' });

    expect(response.body.conversation.participants).toHaveLength(1);
  });
});

describe('GET /api/conversations', () => {
  test('lists only conversations the user participates in', async () => {
    const carol = await TestHelpers.signupUser('list-carol@example.com', 'password123', 'Carol');
    const dave = await TestHelpers.signupUser('list-dave@example.com', 'password123', 'Dave');
    const erin = await TestHelpers.signupUser('list-erin@example.com', 'password123', 'Erin');

    await request(app)
      .post('/api/conversations')
      .set(authed(carol.token))
      .send({ title: 'Carol & Dave', participantIds: [dave.user.id] });

    await request(app).post('/api/conversations').set(authed(erin.token)).send({ title: 'Erin only' });

    const carolList = await request(app).get('/api/conversations').set(authed(carol.token));
    const daveList = await request(app).get('/api/conversations').set(authed(dave.token));
    const erinList = await request(app).get('/api/conversations').set(authed(erin.token));

    expect(carolList.body.conversations.map((item) => item.title)).toEqual(['Carol & Dave']);
    expect(daveList.body.conversations.map((item) => item.title)).toEqual(['Carol & Dave']);
    expect(erinList.body.conversations.map((item) => item.title)).toEqual(['Erin only']);
  });

  test('returns an empty list for a user without conversations', async () => {
    const frank = await TestHelpers.signupUser('list-frank@example.com', 'password123', 'Frank');

    const response = await request(app).get('/api/conversations').set(authed(frank.token));

    expect(response.statusCode).toBe(200);
    expect(response.body.conversations).toEqual([]);
  });

  test('includes the latest message of each conversation', async () => {
    const gina = await TestHelpers.signupUser('list-gina@example.com', 'password123', 'Gina');

    await request(app)
      .post('/api/conversations')
      .set(authed(gina.token))
      .send({ type: 'ai', withAi: true });

    const response = await request(app).get('/api/conversations').set(authed(gina.token));

    expect(response.body.conversations[0].messages).toHaveLength(1);
    expect(response.body.conversations[0].messages[0].senderRole).toBe('assistant');
  });

  test('orders conversations by most recently updated first', async () => {
    const hank = await TestHelpers.signupUser('list-hank@example.com', 'password123', 'Hank');

    const first = await request(app).post('/api/conversations').set(authed(hank.token)).send({ title: 'First' });
    await request(app).post('/api/conversations').set(authed(hank.token)).send({ title: 'Second' });

    const ConversationService = require('../src/services/ConversationService');
    await ConversationService.touch(first.body.conversation.id);

    const response = await request(app).get('/api/conversations').set(authed(hank.token));

    expect(response.body.conversations.map((item) => item.title)).toEqual(['First', 'Second']);
  });
});

describe('POST /api/conversations/direct', () => {
  let alice;

  beforeAll(async () => {
    alice = await TestHelpers.signupUser('direct-alice@example.com', 'password123', 'Alice');
  });

  test('requires userId', async () => {
    const response = await request(app).post('/api/conversations/direct').set(authed(alice.token)).send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('userId required');
  });

  test('error message for chatting with yourself is explicit', async () => {
    const response = await request(app)
      .post('/api/conversations/direct')
      .set(authed(alice.token))
      .send({ userId: alice.user.id });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('cannot start a chat with yourself');
  });

  test('the AI Assistant user cannot be opened as a direct chat', async () => {
    const assistant = await UserService.findOrCreateAssistant();

    const response = await request(app)
      .post('/api/conversations/direct')
      .set(authed(alice.token))
      .send({ userId: assistant.id });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('user not found');
  });

  test('does not reuse a group conversation as a direct chat', async () => {
    const bob = await TestHelpers.signupUser('direct-bob@example.com', 'password123', 'Bob');

    // Percakapan bertipe "group" berisi Alice & Bob tidak boleh dianggap sebagai DM.
    await request(app)
      .post('/api/conversations')
      .set(authed(alice.token))
      .send({ type: 'group', title: 'Group', participantIds: [bob.user.id] });

    const response = await request(app)
      .post('/api/conversations/direct')
      .set(authed(alice.token))
      .send({ userId: bob.user.id });

    expect(response.statusCode).toBe(200);
    expect(response.body.isNew).toBe(true);
    expect(response.body.conversation.type).toBe('dm');
    expect(response.body.conversation.participants).toHaveLength(2);
  });

  test('returns participants without password hashes', async () => {
    const carol = await TestHelpers.signupUser('direct-carol@example.com', 'password123', 'Carol');

    const response = await request(app)
      .post('/api/conversations/direct')
      .set(authed(alice.token))
      .send({ userId: carol.user.id });

    for (const participant of response.body.conversation.participants) {
      expect(participant.user.passwordHash).toBeUndefined();
    }
  });
});

describe('GET /api/conversations/:id/messages', () => {
  test('returns messages oldest first', async () => {
    const MessageService = require('../src/services/MessageService');
    const ivy = await TestHelpers.signupUser('msg-ivy@example.com', 'password123', 'Ivy');

    const created = await request(app).post('/api/conversations').set(authed(ivy.token)).send({ title: 'Order' });
    const conversationId = created.body.conversation.id;

    await MessageService.createUserMessage(conversationId, ivy.user.id, 'first');
    await MessageService.createUserMessage(conversationId, ivy.user.id, 'second');
    await MessageService.createUserMessage(conversationId, ivy.user.id, 'third');

    const response = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set(authed(ivy.token));

    expect(response.statusCode).toBe(200);
    expect(response.body.messages.map((message) => message.content)).toEqual(['first', 'second', 'third']);
    expect(response.body.messages[0].senderId).toBe(ivy.user.id);
  });

  test('every participant can read the messages', async () => {
    const MessageService = require('../src/services/MessageService');
    const jack = await TestHelpers.signupUser('msg-jack@example.com', 'password123', 'Jack');
    const kate = await TestHelpers.signupUser('msg-kate@example.com', 'password123', 'Kate');

    const created = await request(app)
      .post('/api/conversations')
      .set(authed(jack.token))
      .send({ participantIds: [kate.user.id] });
    const conversationId = created.body.conversation.id;

    await MessageService.createUserMessage(conversationId, jack.user.id, 'hello kate');

    const response = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set(authed(kate.token));

    expect(response.statusCode).toBe(200);
    expect(response.body.messages).toHaveLength(1);
  });

  test('a conversation without messages returns an empty list', async () => {
    const leo = await TestHelpers.signupUser('msg-leo@example.com', 'password123', 'Leo');
    const created = await request(app).post('/api/conversations').set(authed(leo.token)).send({});

    const response = await request(app)
      .get(`/api/conversations/${created.body.conversation.id}/messages`)
      .set(authed(leo.token));

    expect(response.statusCode).toBe(200);
    expect(response.body.messages).toEqual([]);
  });

  test('an unknown conversation id is forbidden, not a server error', async () => {
    const mia = await TestHelpers.signupUser('msg-mia@example.com', 'password123', 'Mia');

    const response = await request(app)
      .get('/api/conversations/00000000-0000-0000-0000-000000000000/messages')
      .set(authed(mia.token));

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe('not allowed');
  });
});
