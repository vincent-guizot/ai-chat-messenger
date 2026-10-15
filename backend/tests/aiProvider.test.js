jest.mock('axios');

const axios = require('axios');
const AiProviderService = require('../src/services/AiProviderService');
const AssistantService = require('../src/services/AssistantService');

const ENV_KEYS = [
  'DEFAULT_PROVIDER',
  'OPENAI_BASE_URL',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'OLLAMA_URL',
  'OLLAMA_MODEL',
  'HUGGINGFACE_API_TOKEN',
  'HUGGINGFACE_MODEL',
];

const savedEnv = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  axios.post.mockReset();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

describe('AiProviderService: OpenAI-compatible provider', () => {
  beforeEach(() => {
    process.env.DEFAULT_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-key';
  });

  test('posts to {base}/chat/completions with bearer token, model and messages', async () => {
    process.env.OPENAI_BASE_URL = 'https://api.example.com/v1/';
    process.env.OPENAI_MODEL = 'my-model';
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'Halo juga!' } }] } });

    const result = await AiProviderService.generate('ignored prompt', [{ role: 'user', content: 'Halo' }]);

    expect(result).toEqual({ text: 'Halo juga!', provider: 'openai', model: 'my-model' });

    const [url, body, options] = axios.post.mock.calls[0];
    // Slash di akhir base URL tidak boleh menghasilkan "//".
    expect(url).toBe('https://api.example.com/v1/chat/completions');
    expect(options.headers.Authorization).toBe('Bearer test-key');
    expect(body.model).toBe('my-model');
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[body.messages.length - 1]).toEqual({ role: 'user', content: 'Halo' });
    expect(body.max_tokens).toBeGreaterThan(0);
  });

  test('defaults to the Groq endpoint and model', async () => {
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'ok' } }] } });

    const result = await AiProviderService.generate('Halo');

    expect(axios.post.mock.calls[0][0]).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(result.model).toBe('llama-3.1-8b-instant');
  });

  test('falls back to the plain prompt as a single user message when no messages are given', async () => {
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'ok' } }] } });

    await AiProviderService.generate('Apa kabar?');

    const body = axios.post.mock.calls[0][1];
    expect(body.messages.slice(1)).toEqual([{ role: 'user', content: 'Apa kabar?' }]);
  });

  test('throws a clear error when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(AiProviderService.generate('Halo')).rejects.toThrow('OPENAI_API_KEY not set in env');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('returns the raw JSON when the response has no choices', async () => {
    axios.post.mockResolvedValue({ data: { error: 'something' } });

    const result = await AiProviderService.generate('Halo');

    expect(result.text).toBe(JSON.stringify({ error: 'something' }));
  });

  test('propagates provider errors (e.g. rate limit) to the caller', async () => {
    axios.post.mockRejectedValue(new Error('Request failed with status code 429'));

    await expect(AiProviderService.generate('Halo')).rejects.toThrow('429');
  });
});

describe('AiProviderService: other providers keep working', () => {
  test('uses Ollama by default', async () => {
    axios.post.mockResolvedValue({ data: { response: 'dari ollama' } });

    const result = await AiProviderService.generate('Halo');

    expect(result).toEqual({ text: 'dari ollama', provider: 'ollama', model: 'llama3.1' });
    expect(axios.post.mock.calls[0][0]).toBe('http://localhost:11434/api/generate');
  });

  test('uses Hugging Face when selected', async () => {
    process.env.DEFAULT_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_TOKEN = 'hf-token';
    axios.post.mockResolvedValue({ data: [{ generated_text: 'dari hf' }] });

    const result = await AiProviderService.generate('Halo');

    expect(result.text).toBe('dari hf');
    expect(result.provider).toBe('huggingface');
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
