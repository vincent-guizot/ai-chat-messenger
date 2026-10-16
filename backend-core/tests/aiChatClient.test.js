jest.mock('axios');
// Test ini murni unit test; Prisma di-mock agar tidak membutuhkan koneksi database.
jest.mock('../prisma/prisma', () => ({}));

// Environment dibaca dan divalidasi sekali saat modul config dimuat,
// jadi nilai ini harus diisi sebelum AiChatClient di-require.
const SERVICE_URL = 'http://aichat.test:3001';
process.env.AI_SERVICE_URL = SERVICE_URL;
process.env.AI_SERVICE_TOKEN = 'shared-token';

const axios = require('axios');
const AiChatClient = require('../src/services/AiChatClient');
const AssistantService = require('../src/services/AssistantService');

beforeEach(() => {
  axios.post.mockReset();
});

describe('AiChatClient.reply', () => {
  test('posts the messages to {AI_SERVICE_URL}/api/ai/reply with the bearer token', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: { ok: true, text: 'Halo juga!', provider: 'openai', model: 'my-model' },
    });

    const messages = [{ role: 'user', content: 'Halo' }];
    const result = await AiChatClient.reply(messages);

    expect(result).toEqual({ text: 'Halo juga!', provider: 'openai', model: 'my-model' });

    const [url, body, options] = axios.post.mock.calls[0];
    expect(url).toBe(`${SERVICE_URL}/api/ai/reply`);
    expect(body).toEqual({ messages: messages });
    expect(options.headers.Authorization).toBe('Bearer shared-token');
    expect(options.timeout).toBeGreaterThan(0);
  });

  test('uses the error message from the AI service when it answers with ok: false', async () => {
    axios.post.mockResolvedValue({
      status: 502,
      data: { ok: false, error: 'OPENAI_API_KEY not set in env' },
    });

    await expect(AiChatClient.reply([])).rejects.toThrow('AI service error: OPENAI_API_KEY not set in env');
  });

  test('falls back to the HTTP status when the error body is not readable', async () => {
    axios.post.mockResolvedValue({ status: 500, data: 'Internal Server Error' });

    await expect(AiChatClient.reply([])).rejects.toThrow('AI service error (HTTP 500)');
  });

  test('reports "AI service unavailable" when the connection fails', async () => {
    const connectionError = new Error('connect ECONNREFUSED');
    connectionError.code = 'ECONNREFUSED';
    axios.post.mockRejectedValue(connectionError);

    await expect(AiChatClient.reply([])).rejects.toThrow('AI service unavailable');
  });

  test('reports a timeout separately', async () => {
    const timeoutError = new Error('timeout of 120000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    axios.post.mockRejectedValue(timeoutError);

    await expect(AiChatClient.reply([])).rejects.toThrow('AI service timed out');
  });

  test('rejects a successful response without text', async () => {
    axios.post.mockResolvedValue({ status: 200, data: { ok: true } });

    await expect(AiChatClient.reply([])).rejects.toThrow('AI service returned an invalid response');
  });
});

describe('AssistantService.buildChatMessages', () => {
  test('maps user messages to "user" and everything else to "assistant", keeping order', () => {
    const messages = [
      { senderRole: 'assistant', content: 'Halo! Saya AI Assistant.' },
      { senderRole: 'user', content: 'Apa itu Node.js?' },
    ];

    expect(AssistantService.buildChatMessages(messages)).toEqual([
      { role: 'assistant', content: 'Halo! Saya AI Assistant.' },
      { role: 'user', content: 'Apa itu Node.js?' },
    ]);
  });

  test('returns an empty array for no messages', () => {
    expect(AssistantService.buildChatMessages([])).toEqual([]);
  });
});
