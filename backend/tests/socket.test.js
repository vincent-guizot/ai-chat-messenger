/* eslint-disable no-undef */
// Socket.IO + AI generation integration test

const path = require('path');
const request = require('supertest');
const { io: Client } = require('socket.io-client');

let server;
let httpServer;
let PORT = 4041;

// mock providers before we require the app
jest.mock('../ai/providers', () => ({
  generateWithOllama: jest.fn().mockResolvedValue('Mocked AI reply'),
  generateWithHuggingFace: jest.fn().mockResolvedValue('Mocked HF reply'),
}));

const { sequelize } = require('../models');
const { app, start } = require('../index');

beforeAll(async () => {
  process.env.PORT = String(PORT);
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  server = await start();
  httpServer = server;
});

afterAll(async () => {
  if (httpServer && httpServer.close) httpServer.close();
  await sequelize.close();
});

async function signupAndGetToken(email) {
  const res = await request(app).post('/api/auth/signup').send({ email, password: 'password123', name: 'Tester' });
  return res.body.token;
}

test('socket message:create -> message:new and AI reply', (done) => {
  (async () => {
    const userToken = await signupAndGetToken('socketuser@example.com');

    // create AI conversation with assistant
    const createRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'ai', title: 'AI Room', withAi: true });

    expect(createRes.statusCode).toBe(200);
    const conversation = createRes.body.conversation;

    const client = new Client(`http://localhost:${PORT}`, { auth: { token: userToken }, transports: ['websocket'], reconnectionDelay: 0, forceNew: true });

    client.on('connect', () => {
      client.emit('join', { conversationId: conversation.id });

      // listen for assistant message too
      let gotUserMessage = false;
      client.on('message:new', (msg) => {
        if (!gotUserMessage && msg.senderRole === 'user') {
          gotUserMessage = true;
          // when we see the user message echoed, wait for AI reply next
        } else if (gotUserMessage && msg.senderRole === 'assistant') {
          // AI reply received
          expect(msg.content).toBeDefined();
          client.disconnect();
          done();
        }
      });

      // send a message
      client.emit('message:create', { conversationId: conversation.id, content: 'Hello AI' });
    });

    client.on('connect_error', (err) => {
      done(err);
    });
  })();
});
