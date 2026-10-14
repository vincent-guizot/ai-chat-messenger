const request = require('supertest');
const { sequelize } = require('../models');
const { app } = require('../index');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

async function signupUser(email, password, name = 'Tester') {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ email, password, name });

  expect(response.statusCode).toBe(200);
  expect(response.body.ok).toBe(true);
  expect(response.body.token).toBeDefined();

  return response.body;
}

describe('Auth API', () => {
  test('signup -> login flow works', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    const signup = await signupUser(email, password, 'Tester');
    expect(signup.user.email).toBe(email);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.ok).toBe(true);
    expect(loginRes.body.token).toBeDefined();
  }, 20000);

  test('health endpoint returns ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
