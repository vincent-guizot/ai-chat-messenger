const request = require('supertest');
const { io: createClient } = require('socket.io-client');

// Service AI (backend-aichat) di-mock agar test tidak membutuhkan Ollama / Groq / Hugging Face.
jest.mock('../src/services/AiChatClient', () => {
  return {
    reply: jest.fn().mockResolvedValue({
      text: 'Mocked AI reply',
      provider: 'mock',
      model: 'mock-model',
    }),
  };
});

const app = require('../src/app');
const { startServer } = require('../src/server');
const TestHelpers = require('./helpers/testHelpers');

const TEST_PORT = 4041;

let server;
const openClients = [];

beforeAll(async () => {
  await TestHelpers.resetDatabase();
  server = await startServer(TEST_PORT);
});

afterEach(() => {
  for (const client of openClients) {
    client.disconnect();
  }
  openClients.length = 0;
});

afterAll(async () => {
  server.io.close();
  await TestHelpers.disconnect();
});

function connectClient(token) {
  const client = createClient(`http://localhost:${TEST_PORT}`, {
    auth: { token: token },
    transports: ['websocket'],
    forceNew: true,
  });

  openClients.push(client);

  return new Promise((resolve, reject) => {
    client.on('connect', () => resolve(client));
    client.on('connect_error', reject);
  });
}

function waitForEvent(client, eventName, matches) {
  return new Promise((resolve) => {
    client.on(eventName, (payload) => {
      if (matches(payload)) {
        resolve(payload);
      }
    });
  });
}

test('AI conversation: user message is echoed and assistant replies', async () => {
  const signup = await TestHelpers.signupUser('socketuser@example.com', 'password123', 'Tester');

  const createResponse = await request(app)
    .post('/api/conversations')
    .set('Authorization', `Bearer ${signup.token}`)
    .send({ type: 'ai', title: 'AI Room', withAi: true });

  const conversationId = createResponse.body.conversation.id;
  const client = await connectClient(signup.token);

  const userMessagePromise = waitForEvent(client, 'message:new', (message) => message.senderRole === 'user');
  const assistantTypingPromise = waitForEvent(client, 'assistant:typing', (payload) => payload.isTyping === true);
  const assistantReplyPromise = waitForEvent(client, 'message:new', (message) => message.senderRole === 'assistant');

  client.emit('message:create', { conversationId: conversationId, content: 'Hello AI' });

  await userMessagePromise;
  await assistantTypingPromise;
  const assistantReply = await assistantReplyPromise;

  expect(assistantReply.content).toBe('Mocked AI reply');
});

test('direct message reaches the other user without joining the room', async () => {
  const sender = await TestHelpers.signupUser('sender@example.com', 'password123', 'Sender');
  const receiver = await TestHelpers.signupUser('receiver@example.com', 'password123', 'Receiver');

  const directResponse = await request(app)
    .post('/api/conversations/direct')
    .set('Authorization', `Bearer ${sender.token}`)
    .send({ userId: receiver.user.id });

  const conversationId = directResponse.body.conversation.id;

  const receiverClient = await connectClient(receiver.token);
  const senderClient = await connectClient(sender.token);

  const receivedPromise = waitForEvent(receiverClient, 'message:new', (message) => {
    return message.conversationId === conversationId;
  });

  senderClient.emit('message:create', { conversationId: conversationId, content: 'Hai Receiver!' });

  const receivedMessage = await receivedPromise;
  expect(receivedMessage.content).toBe('Hai Receiver!');
  expect(receivedMessage.senderId).toBe(sender.user.id);
});

test('presence: contacts see who is online and typing events are delivered', async () => {
  const userA = await TestHelpers.signupUser('presence-a@example.com', 'password123', 'User A');
  const userB = await TestHelpers.signupUser('presence-b@example.com', 'password123', 'User B');

  const clientA = await connectClient(userA.token);

  const onlinePromise = waitForEvent(clientA, 'presence:update', (payload) => {
    return payload.userId === userB.user.id && payload.online === true;
  });

  const clientB = await connectClient(userB.token);
  await onlinePromise;

  const contactsResponse = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${userA.token}`);

  const userBContact = contactsResponse.body.users.find((user) => user.id === userB.user.id);
  expect(userBContact.online).toBe(true);

  const directResponse = await request(app)
    .post('/api/conversations/direct')
    .set('Authorization', `Bearer ${userA.token}`)
    .send({ userId: userB.user.id });

  const conversationId = directResponse.body.conversation.id;

  const typingPromise = waitForEvent(clientB, 'typing', (payload) => payload.conversationId === conversationId);
  clientA.emit('typing', { conversationId: conversationId, isTyping: true });

  const typingEvent = await typingPromise;
  expect(typingEvent.userId).toBe(userA.user.id);
  expect(typingEvent.isTyping).toBe(true);

  const offlinePromise = waitForEvent(clientA, 'presence:update', (payload) => {
    return payload.userId === userB.user.id && payload.online === false;
  });

  clientB.disconnect();

  const offlineEvent = await offlinePromise;
  expect(offlineEvent.lastSeenAt).toBeTruthy();
});
