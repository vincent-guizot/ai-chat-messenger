const axios = require('axios');
const Environment = require('../config/environment');

const REQUEST_TIMEOUT_MS = 120000;
const DEFAULT_MAX_NEW_TOKENS = 512;

/**
 * Pembungkus untuk penyedia model AI (Ollama dan Hugging Face).
 */
class AiProviderService {
  /**
   * Memanggil provider yang dipilih di DEFAULT_PROVIDER.
   * Mengembalikan { text, provider, model }.
   */
  static async generate(prompt) {
    const provider = Environment.aiProvider;

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
