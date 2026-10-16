const request = require('supertest');
const jsonWebToken = require('jsonwebtoken');
const app = require('../src/app');
const Environment = require('../src/config/environment');
const TestHelpers = require('./helpers/testHelpers');
const prisma = require('../prisma/prisma');

afterAll(async () => {
  await TestHelpers.disconnect();
});

// Semua endpoint di bawah ini wajib login.
const PROTECTED_ENDPOINTS = [
  ['get', '/api/users'],
  ['get', '/api/users/me'],
  ['get', '/api/conversations'],
  ['post', '/api/conversations'],
  ['post', '/api/conversations/direct'],
  ['get', '/api/conversations/some-id/messages'],
  ['get', '/api/notifications'],
  ['patch', '/api/notifications/read-all'],
  ['patch', '/api/notifications/some-id/read'],
];

describe('Authentication middleware', () => {
  describe.each(PROTECTED_ENDPOINTS)('%s %s', (method, path) => {
    test('rejects a request without a token', async () => {
      const response = await request(app)[method](path);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ ok: false, error: 'missing token' });
    });

    test('rejects a request with a malformed token', async () => {
      const response = await request(app)[method](path).set('Authorization', 'Bearer not-a-jwt');

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ ok: false, error: 'invalid token' });
    });
  });

  test('rejects an Authorization header that is not a Bearer scheme', async () => {
    const signup = await TestHelpers.signupUser('scheme@example.com', 'password123', 'Scheme');

    const response = await request(app).get('/api/users/me').set('Authorization', `Token ${signup.token}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('missing token');
  });

  test('rejects an expired token', async () => {
    const expiredToken = jsonWebToken.sign(
      { sub: 'someone', email: 'someone@example.com' },
      Environment.jwtSecret,
      { expiresIn: -10 }
    );

    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${expiredToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('invalid token');
  });

  test('rejects a token signed with a different secret', async () => {
    const forgedToken = jsonWebToken.sign({ sub: 'someone', email: 'someone@example.com' }, 'another-secret');

    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${forgedToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('invalid token');
  });

  test('rejects a valid token whose user no longer exists in the database', async () => {
    const signup = await TestHelpers.signupUser('deleted-user@example.com', 'password123', 'Deleted');

    // Simulasi database diganti / user dihapus setelah token diterbitkan.
    await prisma.user.delete({ where: { id: signup.user.id } });

    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${signup.token}`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ ok: false, error: 'user not found' });
  });

  test('accepts a valid token', async () => {
    const signup = await TestHelpers.signupUser('valid-token@example.com', 'password123', 'Valid');

    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${signup.token}`);

    expect(response.statusCode).toBe(200);
  });
});
