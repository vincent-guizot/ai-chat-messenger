const request = require('supertest');
const jsonWebToken = require('jsonwebtoken');
const app = require('../src/app');
const Environment = require('../src/config/environment');
const UserService = require('../src/services/UserService');
const TestHelpers = require('./helpers/testHelpers');

beforeAll(async () => {
  await TestHelpers.resetDatabase();
});

afterAll(async () => {
  await TestHelpers.disconnect();
});

describe('GET /api/users/me', () => {
  test('returns the logged-in user without the password hash', async () => {
    const signup = await TestHelpers.signupUser('me@example.com', 'password123', 'Me');

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${signup.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.user).toEqual(
      expect.objectContaining({ id: signup.user.id, email: 'me@example.com', name: 'Me' })
    );
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('returns 404 when the token is valid but the user no longer exists', async () => {
    const orphanToken = jsonWebToken.sign(
      { sub: '00000000-0000-0000-0000-000000000000', email: 'deleted@example.com' },
      Environment.jwtSecret
    );

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${orphanToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ ok: false, error: 'user not found' });
  });
});

describe('GET /api/users', () => {
  test('hides the AI Assistant from the contact list', async () => {
    const viewer = await TestHelpers.signupUser('viewer@example.com', 'password123', 'Viewer');
    await UserService.findOrCreateAssistant();

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${viewer.token}`);

    expect(response.statusCode).toBe(200);

    const emails = response.body.users.map((user) => user.email);
    expect(emails).not.toContain(UserService.ASSISTANT_EMAIL);
    expect(emails).not.toContain('viewer@example.com');
  });

  test('returns an empty list when the user is alone', async () => {
    await TestHelpers.resetDatabase();
    const loner = await TestHelpers.signupUser('loner@example.com', 'password123', 'Loner');

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${loner.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toEqual([]);
  });

  test('sorts contacts by name when nobody is online', async () => {
    await TestHelpers.resetDatabase();
    const viewer = await TestHelpers.signupUser('sort-viewer@example.com', 'password123', 'Viewer');
    await TestHelpers.signupUser('sort-c@example.com', 'password123', 'Charlie');
    await TestHelpers.signupUser('sort-a@example.com', 'password123', 'Alpha');
    await TestHelpers.signupUser('sort-b@example.com', 'password123', 'Bravo');

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${viewer.token}`);

    expect(response.body.users.map((user) => user.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });
});
