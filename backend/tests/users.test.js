const request = require('supertest');
const app = require('../src/app');
const TestHelpers = require('./helpers/testHelpers');

beforeAll(async () => {
  await TestHelpers.resetDatabase();
});

afterAll(async () => {
  await TestHelpers.disconnect();
});

describe('Users & direct conversations', () => {
  let alice;
  let bob;

  beforeAll(async () => {
    alice = await TestHelpers.signupUser('alice.dm@example.com', 'password123', 'Alice');
    bob = await TestHelpers.signupUser('bob.dm@example.com', 'password123', 'Bob');
  });

  test('contacts list excludes the current user', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${alice.token}`);

    expect(response.statusCode).toBe(200);

    const emails = response.body.users.map((user) => user.email);
    expect(emails).toContain('bob.dm@example.com');
    expect(emails).not.toContain('alice.dm@example.com');
    expect(response.body.users[0].passwordHash).toBeUndefined();
    expect(response.body.users[0].online).toBe(false);
  });

  test('direct conversation is created once and then reused', async () => {
    const firstResponse = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ userId: bob.user.id });

    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body.isNew).toBe(true);
    expect(firstResponse.body.conversation.type).toBe('dm');

    // Bob membuka chat ke Alice -> harus mendapat percakapan yang sama.
    const secondResponse = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${bob.token}`)
      .send({ userId: alice.user.id });

    expect(secondResponse.body.isNew).toBe(false);
    expect(secondResponse.body.conversation.id).toBe(firstResponse.body.conversation.id);
  });

  test('cannot start a direct chat with yourself', async () => {
    const response = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ userId: alice.user.id });

    expect(response.statusCode).toBe(400);
  });

  test('unknown user returns 404', async () => {
    const response = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ userId: '00000000-0000-0000-0000-000000000000' });

    expect(response.statusCode).toBe(404);
  });
});
