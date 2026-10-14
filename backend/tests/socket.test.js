const request = require('supertest');
const { io: createClient } = require('socket.io-client');

// Provider AI di-mock agar test tidak membutuhkan Ollama / Hugging Face.
jest.mock('../src/services/AiProviderService', () => {
  return {
    generate: jest.fn().mockResolvedValue({
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

beforeAll(async () => {
  await TestHelpers.resetDatabase();
  server = await startServer(TEST_PORT);
});

afterAll(async () => {
  server.io.close();
  await TestHelpers.disconnect();
});

function waitForAssistantReply(client) {
  return new Promise((resolve, reject) => {
    let receivedUserMessage = false;

    client.on('message:new', (message) => {
      if (message.senderRole === 'user') {
        receivedUserMessage = true;
        return;
      }

      if (receivedUserMessage && message.senderRole === 'assistant') {
        resolve(message);
      }
    });

    client.on('connect_error', reject);
  });
}

test('socket message:create -> message:new and AI reply', async () => {
  const signup = await TestHelpers.signupUser('socketuser@example.com', 'password123', 'Tester');

  const createResponse = await request(app)
    .post('/api/conversations')
    .set('Authorization', `Bearer ${signup.token}`)
    .send({ type: 'ai', title: 'AI Room', withAi: true });

  expect(createResponse.statusCode).toBe(200);

  const conversationId = createResponse.body.conversation.id;

  const client = createClient(`http://localhost:${TEST_PORT}`, {
    auth: { token: signup.token },
    transports: ['websocket'],
    forceNew: true,
  });

  const assistantReplyPromise = waitForAssistantReply(client);

  client.on('connect', () => {
    client.emit('join', { conversationId: conversationId });

    // Beri sedikit waktu agar proses "join" selesai sebelum mengirim pesan.
    setTimeout(() => {
      client.emit('message:create', { conversationId: conversationId, content: 'Hello AI' });
    }, 200);
  });

  const assistantReply = await assistantReplyPromise;

  expect(assistantReply.content).toBe('Mocked AI reply');

  client.disconnect();
});
