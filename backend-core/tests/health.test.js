const request = require('supertest');
const app = require('../src/app');
const TestHelpers = require('./helpers/testHelpers');

afterAll(async () => {
  await TestHelpers.disconnect();
});

describe('Health & routing', () => {
  test('GET /api/health returns ok without authentication', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('unknown route returns a JSON 404', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ ok: false, error: 'route not found' });
  });

  test('wrong HTTP method on an existing path returns 404', async () => {
    const response = await request(app).delete('/api/health');

    expect(response.statusCode).toBe(404);
    expect(response.body.ok).toBe(false);
  });

  test('malformed JSON body is rejected with 400, not a server error', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken"');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ ok: false, error: 'invalid JSON body' });
  });
});
