const request = require('supertest');
const app = require('../src/app');
const TestHelpers = require('./helpers/testHelpers');

beforeAll(async () => {
  await TestHelpers.resetDatabase();
});

afterAll(async () => {
  await TestHelpers.disconnect();
});

describe('Auth API', () => {
  test('signup -> login flow works', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    const signup = await TestHelpers.signupUser(email, password, 'Tester');
    expect(signup.user.email).toBe(email);
    expect(signup.user.passwordHash).toBeUndefined();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: email, password: password });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.ok).toBe(true);
    expect(loginResponse.body.token).toBeDefined();
  });

  test('login with wrong password is rejected', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong-password' });

    expect(loginResponse.statusCode).toBe(400);
    expect(loginResponse.body.ok).toBe(false);
  });

  test('signup with an existing email is rejected', async () => {
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(signupResponse.statusCode).toBe(400);
    expect(signupResponse.body.error).toBe('email already in use');
  });

  test('health endpoint returns ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
