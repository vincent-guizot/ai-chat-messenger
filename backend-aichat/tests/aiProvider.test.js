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

/**
 * Environment dibaca dan divalidasi sekali saat modul config dimuat, jadi untuk
 * setiap kombinasi env, modul harus dimuat ulang. Mengembalikan service + axios yang
 * sudah di-mock (instance mock ikut baru setelah resetModules).
 */
function loadServiceWithEnv(overrides) {
  // Diisi string kosong (bukan dihapus) agar dotenv tidak mengisinya lagi dari file .env;
  // string kosong dianggap "tidak diisi" oleh config.
  for (const key of ENV_KEYS) {
    process.env[key] = '';
  }

  for (const key of Object.keys(overrides)) {
    process.env[key] = overrides[key];
  }

  jest.resetModules();
  jest.mock('axios');

  const axios = require('axios');
  const AiProviderService = require('../src/services/AiProviderService');

  return { axios: axios, AiProviderService: AiProviderService };
}

beforeAll(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
  }
});

afterAll(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

const HALO = [{ role: 'user', content: 'Halo' }];

describe('AiProviderService: OpenAI-compatible provider', () => {
  const openAiEnv = { DEFAULT_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' };

  test('posts to {base}/chat/completions with bearer token, model and messages', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv({
      ...openAiEnv,
      OPENAI_BASE_URL: 'https://api.example.com/v1/',
      OPENAI_MODEL: 'my-model',
    });
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'Halo juga!' } }] } });

    const result = await AiProviderService.generate(HALO);

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
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'ok' } }] } });

    const result = await AiProviderService.generate(HALO);

    expect(axios.post.mock.calls[0][0]).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(result.model).toBe('llama-3.1-8b-instant');
  });

  test('sends the whole chat history after the system prompt', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'ok' } }] } });

    const history = [
      { role: 'user', content: 'Halo' },
      { role: 'assistant', content: 'Hai!' },
      { role: 'user', content: 'Apa kabar?' },
    ];

    await AiProviderService.generate(history);

    const body = axios.post.mock.calls[0][1];
    expect(body.messages.slice(1)).toEqual(history);
  });

  test('throws a clear error when OPENAI_API_KEY is missing', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv({ DEFAULT_PROVIDER: 'openai' });

    await expect(AiProviderService.generate(HALO)).rejects.toThrow('OPENAI_API_KEY not set in env');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('returns the raw JSON when the response has no choices', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({ data: { error: 'something' } });

    const result = await AiProviderService.generate(HALO);

    expect(result.text).toBe(JSON.stringify({ error: 'something' }));
  });

  test('propagates provider errors (e.g. rate limit) to the caller', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockRejectedValue(new Error('Request failed with status code 429'));

    await expect(AiProviderService.generate(HALO)).rejects.toThrow('429');
  });
});

describe('AiProviderService: other providers keep working', () => {
  test('uses Ollama by default with a plain-text prompt', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv({});
    axios.post.mockResolvedValue({ data: { response: 'dari ollama' } });

    const result = await AiProviderService.generate(HALO);

    expect(result).toEqual({ text: 'dari ollama', provider: 'ollama', model: 'llama3.1' });

    const [url, body] = axios.post.mock.calls[0];
    expect(url).toBe('http://localhost:11434/api/generate');
    expect(body.prompt).toBe('User: Halo\nAssistant:');
  });

  test('uses Hugging Face when selected', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv({
      DEFAULT_PROVIDER: 'huggingface',
      HUGGINGFACE_API_TOKEN: 'hf-token',
    });
    axios.post.mockResolvedValue({ data: [{ generated_text: 'dari hf' }] });

    const result = await AiProviderService.generate(HALO);

    expect(result.text).toBe('dari hf');
    expect(result.provider).toBe('huggingface');
    expect(axios.post.mock.calls[0][1].inputs).toBe('User: Halo\nAssistant:');
  });
});

describe('AiProviderService.buildPrompt', () => {
  test('writes one "Speaker: text" line per message and ends with "Assistant:"', () => {
    const { AiProviderService } = loadServiceWithEnv({});

    const prompt = AiProviderService.buildPrompt([
      { role: 'assistant', content: 'Halo! Saya AI Assistant.' },
      { role: 'user', content: 'Apa itu Node.js?' },
    ]);

    expect(prompt).toBe('Assistant: Halo! Saya AI Assistant.\nUser: Apa itu Node.js?\nAssistant:');
  });

  test('returns only "Assistant:" for an empty history', () => {
    const { AiProviderService } = loadServiceWithEnv({});

    expect(AiProviderService.buildPrompt([])).toBe('Assistant:');
  });
});

describe('AiProviderService: usage logging (developer only)', () => {
  const openAiEnv = { DEFAULT_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' };
  let infoLog;

  beforeEach(() => {
    infoLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    infoLog.mockRestore();
  });

  test('logs token usage and remaining quota from the response and headers', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 120, completion_tokens: 30, total_tokens: 150 },
      },
      headers: {
        'x-ratelimit-limit-requests': '1000',
        'x-ratelimit-remaining-requests': '900',
        'x-ratelimit-limit-tokens': '8000',
        'x-ratelimit-remaining-tokens': '7850',
      },
    });

    await AiProviderService.generate(HALO);

    expect(infoLog).toHaveBeenCalledTimes(1);
    const line = infoLog.mock.calls[0][0];
    expect(line).toContain('[ai:usage]');
    expect(line).toContain('tokens prompt/jawaban/total=120/30/150');
    expect(line).toContain('sisa token/menit=7850/8000');
    expect(line).toContain('sisa request/hari=900/1000');
    expect(line).not.toContain('PERINGATAN');
  });

  test('warns when 10% or less of the daily requests is left', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'ok' } }] },
      headers: { 'x-ratelimit-limit-requests': '1000', 'x-ratelimit-remaining-requests': '100' },
    });

    await AiProviderService.generate(HALO);

    expect(infoLog.mock.calls[0][0]).toContain('PERINGATAN: kuota hampir habis');
  });

  test('warns when 10% or less of the per-minute tokens is left', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'ok' } }] },
      headers: { 'x-ratelimit-limit-tokens': '8000', 'x-ratelimit-remaining-tokens': '500' },
    });

    await AiProviderService.generate(HALO);

    expect(infoLog.mock.calls[0][0]).toContain('PERINGATAN: kuota hampir habis');
  });

  test('logs nothing when the provider sends neither usage nor rate-limit headers', async () => {
    const { axios, AiProviderService } = loadServiceWithEnv(openAiEnv);
    axios.post.mockResolvedValue({ data: { choices: [{ message: { content: 'ok' } }] } });

    await AiProviderService.generate(HALO);

    expect(infoLog).not.toHaveBeenCalled();
  });
});
