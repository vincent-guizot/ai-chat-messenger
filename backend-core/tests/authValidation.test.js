const request = require('supertest');
const app = require('../src/app');
const TestHelpers = require('./helpers/testHelpers');

beforeAll(async () => {
  await TestHelpers.resetDatabase();
});

afterAll(async () => {
  await TestHelpers.disconnect();
});

describe('POST /api/auth/signup validation', () => {
  test('rejects a missing email', async () => {
    const response = await request(app).post('/api/auth/signup').send({ password: 'password123' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ ok: false, error: 'email and password required' });
  });

  test('rejects a missing password', async () => {
    const response = await request(app).post('/api/auth/signup').send({ email: 'nopass@example.com' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('email and password required');
  });

  test('rejects an empty body', async () => {
    const response = await request(app).post('/api/auth/signup').send({});

    expect(response.statusCode).toBe(400);
  });

  test('uses the part of the email before "@" as the default name', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'defaultname@example.com', password: 'password123' });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toBe('defaultname');
  });

  test('returns a public user without the password hash', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'public@example.com', password: 'password123', name: 'Public' });

    expect(response.body.user).toEqual(
      expect.objectContaining({ email: 'public@example.com', name: 'Public', online: false })
    );
    expect(response.body.user.id).toBeDefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('stores the password hashed, not as plain text', async () => {
    const prisma = require('../prisma/prisma');
    await TestHelpers.signupUser('hashed@example.com', 'password123', 'Hashed');

    const stored = await prisma.user.findUnique({ where: { email: 'hashed@example.com' } });

    expect(stored.passwordHash).not.toBe('password123');
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  test('creates exactly one welcome notification', async () => {
    const signup = await TestHelpers.signupUser('welcome@example.com', 'password123', 'Welcome');

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${signup.token}`);

    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0].title).toBe('Welcome to AI Chat Messenger');
  });
});

describe('POST /api/auth/login validation', () => {
  beforeAll(async () => {
    await TestHelpers.signupUser('login@example.com', 'password123', 'Login');
  });

  test('rejects a missing email', async () => {
    const response = await request(app).post('/api/auth/login').send({ password: 'password123' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('email and password required');
  });

  test('rejects a missing password', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'login@example.com' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('email and password required');
  });

  test('rejects an unknown email with the same message as a wrong password', async () => {
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' });

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong-password' });

    expect(unknownEmail.statusCode).toBe(400);
    expect(unknownEmail.body.error).toBe('invalid credentials');
    // Pesan sama agar tidak membocorkan email mana yang terdaftar.
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });

  test('returns a token that works on protected endpoints', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.user.passwordHash).toBeUndefined();

    const meResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.body.user.email).toBe('login@example.com');
  });
});
