const request = require('supertest');
const app = require('../src/app');
const NotificationService = require('../src/services/NotificationService');
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

describe('GET /api/notifications', () => {
  test('returns only the notifications of the logged-in user', async () => {
    const alice = await TestHelpers.signupUser('n-alice@example.com', 'password123', 'Alice');
    const bob = await TestHelpers.signupUser('n-bob@example.com', 'password123', 'Bob');

    await NotificationService.create({ userId: alice.user.id, title: 'For Alice' });

    const aliceList = await request(app).get('/api/notifications').set(authed(alice.token));
    const bobList = await request(app).get('/api/notifications').set(authed(bob.token));

    expect(aliceList.body.notifications.map((item) => item.title)).toContain('For Alice');
    expect(bobList.body.notifications.map((item) => item.title)).not.toContain('For Alice');
    expect(aliceList.body.unreadCount).toBe(2);
    expect(bobList.body.unreadCount).toBe(1);
  });

  test('lists the newest notification first', async () => {
    const carol = await TestHelpers.signupUser('n-carol@example.com', 'password123', 'Carol');

    await NotificationService.create({ userId: carol.user.id, title: 'Older' });
    await new Promise((resolve) => setTimeout(resolve, 10));
    await NotificationService.create({ userId: carol.user.id, title: 'Newest' });

    const response = await request(app).get('/api/notifications').set(authed(carol.token));

    expect(response.body.notifications[0].title).toBe('Newest');
  });

  test('is capped at 30 notifications while unreadCount counts all of them', async () => {
    const dave = await TestHelpers.signupUser('n-dave@example.com', 'password123', 'Dave');

    for (let index = 0; index < 34; index += 1) {
      await NotificationService.create({ userId: dave.user.id, title: `Notification ${index}` });
    }

    const response = await request(app).get('/api/notifications').set(authed(dave.token));

    expect(response.body.notifications).toHaveLength(30);
    expect(response.body.unreadCount).toBe(35);
  });

  test('includes actor details without leaking the password hash', async () => {
    const erin = await TestHelpers.signupUser('n-erin@example.com', 'password123', 'Erin');
    const frank = await TestHelpers.signupUser('n-frank@example.com', 'password123', 'Frank');

    await NotificationService.create({
      userId: erin.user.id,
      type: NotificationService.TYPES.message,
      title: 'New message from Frank',
      actorId: frank.user.id,
    });

    const response = await request(app).get('/api/notifications').set(authed(erin.token));
    const withActor = response.body.notifications.find((item) => item.actor);

    expect(withActor.actor).toEqual({ id: frank.user.id, name: 'Frank', email: 'n-frank@example.com' });
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  test('marking an unknown notification returns 404', async () => {
    const gina = await TestHelpers.signupUser('n-gina@example.com', 'password123', 'Gina');

    const response = await request(app)
      .patch('/api/notifications/00000000-0000-0000-0000-000000000000/read')
      .set(authed(gina.token));

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ ok: false, error: 'notification not found' });
  });

  test('marking an already-read notification keeps the original readAt', async () => {
    const hank = await TestHelpers.signupUser('n-hank@example.com', 'password123', 'Hank');
    const list = await request(app).get('/api/notifications').set(authed(hank.token));
    const notificationId = list.body.notifications[0].id;

    const first = await request(app).patch(`/api/notifications/${notificationId}/read`).set(authed(hank.token));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const second = await request(app).patch(`/api/notifications/${notificationId}/read`).set(authed(hank.token));

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.body.notification.readAt).toBe(first.body.notification.readAt);
  });

  test('does not change the unread count of other users', async () => {
    const ivy = await TestHelpers.signupUser('n-ivy@example.com', 'password123', 'Ivy');
    const jack = await TestHelpers.signupUser('n-jack@example.com', 'password123', 'Jack');

    const ivyList = await request(app).get('/api/notifications').set(authed(ivy.token));
    await request(app)
      .patch(`/api/notifications/${ivyList.body.notifications[0].id}/read`)
      .set(authed(ivy.token));

    const jackList = await request(app).get('/api/notifications').set(authed(jack.token));
    expect(jackList.body.unreadCount).toBe(1);
  });
});

describe('PATCH /api/notifications/read-all', () => {
  test('marks everything as read and reports how many were updated', async () => {
    const kate = await TestHelpers.signupUser('n-kate@example.com', 'password123', 'Kate');
    await NotificationService.create({ userId: kate.user.id, title: 'Second' });
    await NotificationService.create({ userId: kate.user.id, title: 'Third' });

    const response = await request(app).patch('/api/notifications/read-all').set(authed(kate.token));

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true, updatedCount: 3 });

    const list = await request(app).get('/api/notifications').set(authed(kate.token));
    expect(list.body.unreadCount).toBe(0);
  });

  test('is idempotent: a second call updates nothing', async () => {
    const leo = await TestHelpers.signupUser('n-leo@example.com', 'password123', 'Leo');

    await request(app).patch('/api/notifications/read-all').set(authed(leo.token));
    const second = await request(app).patch('/api/notifications/read-all').set(authed(leo.token));

    expect(second.body.updatedCount).toBe(0);
  });

  test("does not touch other users' notifications", async () => {
    const mia = await TestHelpers.signupUser('n-mia@example.com', 'password123', 'Mia');
    const ned = await TestHelpers.signupUser('n-ned@example.com', 'password123', 'Ned');

    await request(app).patch('/api/notifications/read-all').set(authed(mia.token));

    const nedList = await request(app).get('/api/notifications').set(authed(ned.token));
    expect(nedList.body.unreadCount).toBe(1);
  });

  test('with an unknown conversationId updates nothing', async () => {
    const olga = await TestHelpers.signupUser('n-olga@example.com', 'password123', 'Olga');

    const response = await request(app)
      .patch('/api/notifications/read-all')
      .set(authed(olga.token))
      .send({ conversationId: '00000000-0000-0000-0000-000000000000' });

    expect(response.statusCode).toBe(200);
    expect(response.body.updatedCount).toBe(0);

    const list = await request(app).get('/api/notifications').set(authed(olga.token));
    expect(list.body.unreadCount).toBe(1);
  });
});
