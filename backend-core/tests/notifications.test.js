const request = require('supertest');
const { io: createClient } = require('socket.io-client');

// Service AI (backend-aichat) di-mock agar test tidak membutuhkan service tersebut berjalan.
jest.mock('../src/services/AiChatClient', () => {
  return {
    reply: jest.fn().mockResolvedValue({ text: 'Mocked AI reply', provider: 'mock', model: 'mock' }),
  };
});

const app = require('../src/app');
const { startServer } = require('../src/server');
const TestHelpers = require('./helpers/testHelpers');

const TEST_PORT = 4042;

let server;
const openClients = [];

beforeAll(async () => {
  await TestHelpers.resetDatabase();
  server = await startServer(TEST_PORT);
});

afterAll(async () => {
  for (const client of openClients) {
    client.disconnect();
  }
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

function getNotifications(token) {
  return request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
}

describe('Notifications', () => {
  let sender;
  let receiver;
  let conversationId;

  beforeAll(async () => {
    sender = await TestHelpers.signupUser('notif-sender@example.com', 'password123', 'Sender');
    receiver = await TestHelpers.signupUser('notif-receiver@example.com', 'password123', 'Receiver');

    const directResponse = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${sender.token}`)
      .send({ userId: receiver.user.id });

    conversationId = directResponse.body.conversation.id;
  });

  test('new users get an unread welcome notification', async () => {
    const response = await getNotifications(receiver.token);

    expect(response.statusCode).toBe(200);
    expect(response.body.unreadCount).toBe(1);
    expect(response.body.notifications[0].type).toBe('system');
  });

  test('a direct message creates a notification for the receiver only', async () => {
    const receiverClient = await connectClient(receiver.token);
    const senderClient = await connectClient(sender.token);

    const notificationPromise = new Promise((resolve) => {
      receiverClient.on('notification:new', resolve);
    });

    senderClient.emit('message:create', { conversationId: conversationId, content: 'Ping!' });

    const notification = await notificationPromise;
    expect(notification.type).toBe('message');
    expect(notification.title).toBe('New message from Sender');
    expect(notification.body).toBe('Ping!');
    expect(notification.conversationId).toBe(conversationId);
    expect(notification.actor.name).toBe('Sender');

    const receiverList = await getNotifications(receiver.token);
    expect(receiverList.body.unreadCount).toBe(2);

    // Pengirim tidak mendapat notifikasi dari pesannya sendiri (hanya welcome).
    const senderList = await getNotifications(sender.token);
    expect(senderList.body.unreadCount).toBe(1);
  });

  test('notifications can be marked as read per conversation and all at once', async () => {
    const readConversation = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${receiver.token}`)
      .send({ conversationId: conversationId });

    expect(readConversation.body.updatedCount).toBe(1);

    const afterConversation = await getNotifications(receiver.token);
    expect(afterConversation.body.unreadCount).toBe(1);

    const welcome = afterConversation.body.notifications.find((item) => item.type === 'system');

    const readOne = await request(app)
      .patch(`/api/notifications/${welcome.id}/read`)
      .set('Authorization', `Bearer ${receiver.token}`);

    expect(readOne.statusCode).toBe(200);
    expect(readOne.body.notification.readAt).toBeTruthy();

    const afterAll = await getNotifications(receiver.token);
    expect(afterAll.body.unreadCount).toBe(0);
  });

  test("users cannot mark someone else's notification", async () => {
    const receiverList = await getNotifications(receiver.token);
    const notificationId = receiverList.body.notifications[0].id;

    const response = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${sender.token}`);

    expect(response.statusCode).toBe(404);
  });
});
