const axios = require('axios');
const Environment = require('../config/environment');

const REQUEST_TIMEOUT_MS = 120000;
const DEFAULT_MAX_NEW_TOKENS = 512;

const SYSTEM_PROMPT =
  'You are a helpful AI Assistant in a chat app. Reply in the same language the user writes in, and keep answers clear and concise.';

/**
 * Pembungkus untuk penyedia model AI: Ollama, Hugging Face, dan provider
 * kompatibel OpenAI (DEFAULT_PROVIDER=openai, mis. Groq).
 */
class AiProviderService {
  /**
   * Memanggil provider yang dipilih di DEFAULT_PROVIDER.
   * `prompt` berupa teks biasa (Ollama / Hugging Face), `messages` berupa
   * [{ role, content }] (provider kompatibel OpenAI).
   * Mengembalikan { text, provider, model }.
   */
  static async generate(prompt, messages) {
    const provider = Environment.aiProvider;

    if (provider === 'openai') {
      const model = Environment.openAiModel;
      const chatMessages = messages || [{ role: 'user', content: prompt }];
      const text = await AiProviderService.generateWithOpenAiCompatible(chatMessages, model);
      return { text: text, provider: provider, model: model };
    }

    if (provider === 'huggingface') {
      const model = Environment.huggingFaceModel;
      const text = await AiProviderService.generateWithHuggingFace(prompt, model);
      return { text: text, provider: provider, model: model };
    }

    const model = Environment.ollamaModel;
    const text = await AiProviderService.generateWithOllama(prompt, model);
    return { text: text, provider: 'ollama', model: model };
  }

  static async generateWithOllama(prompt, model) {
    const url = `${Environment.ollamaUrl}/api/generate`;

    const requestBody = {
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: DEFAULT_MAX_NEW_TOKENS,
      },
    };

    const response = await axios.post(url, requestBody, { timeout: REQUEST_TIMEOUT_MS });
    const data = response.data;

    if (data && data.response) {
      return data.response;
    }

    return JSON.stringify(data);
  }

  /**
   * POST {OPENAI_BASE_URL}/chat/completions (format OpenAI, dipakai Groq, Cerebras, OpenRouter, dll.).
   */
  static async generateWithOpenAiCompatible(messages, model) {
    const apiKey = Environment.openAiApiKey;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not set in env');
    }

    const url = `${Environment.openAiBaseUrl}/chat/completions`;

    const requestBody = {
      model: model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: DEFAULT_MAX_NEW_TOKENS,
    };

    const requestOptions = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const response = await axios.post(url, requestBody, requestOptions);
    const data = response.data;

    const firstChoice = data && Array.isArray(data.choices) ? data.choices[0] : null;

    if (firstChoice && firstChoice.message && firstChoice.message.content) {
      return firstChoice.message.content;
    }

    return JSON.stringify(data);
  }

  static async generateWithHuggingFace(prompt, model) {
    const token = Environment.huggingFaceToken;

    if (!token) {
      throw new Error('HUGGINGFACE_API_TOKEN not set in env');
    }

    const url = `${Environment.huggingFaceApiUrl}/${model}`;

    const requestBody = {
      inputs: prompt,
      parameters: {
        max_new_tokens: DEFAULT_MAX_NEW_TOKENS,
      },
      options: {
        wait_for_model: true,
      },
    };

    const requestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const response = await axios.post(url, requestBody, requestOptions);
    const data = response.data;

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return data[0].generated_text;
    }

    if (data && data.generated_text) {
      return data.generated_text;
    }

    if (typeof data === 'string') {
      return data;
    }

    return JSON.stringify(data);
  }
}

module.exports = AiProviderService;
