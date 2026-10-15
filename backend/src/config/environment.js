const dotenv = require('dotenv');

dotenv.config();

/**
 * Semua konfigurasi aplikasi dibaca dari environment variable di satu tempat,
 * sehingga file lain tidak perlu membaca process.env secara langsung.
 */
class Environment {
  static get port() {
    return Number(process.env.PORT || 3000);
  }

  static get corsOrigin() {
    return process.env.CORS_ORIGIN || '*';
  }

  static get jwtSecret() {
    return process.env.JWT_SECRET || 'replace_this';
  }

  static get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  static get aiProvider() {
    return process.env.DEFAULT_PROVIDER || 'ollama';
  }

  static get ollamaUrl() {
    return process.env.OLLAMA_URL || 'http://localhost:11434';
  }

  static get ollamaModel() {
    return process.env.OLLAMA_MODEL || 'llama3.1';
  }

  // Provider kompatibel OpenAI (Groq, Cerebras, OpenRouter, Mistral, dll.).
  static get openAiBaseUrl() {
    return (process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
  }

  static get openAiApiKey() {
    return process.env.OPENAI_API_KEY || '';
  }

  static get openAiModel() {
    return process.env.OPENAI_MODEL || 'llama-3.1-8b-instant';
  }

  static get huggingFaceToken() {
    return process.env.HUGGINGFACE_API_TOKEN || '';
  }

  static get huggingFaceModel() {
    return process.env.HUGGINGFACE_MODEL || 'gpt2';
  }

  static get huggingFaceApiUrl() {
    return process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models';
  }
}

module.exports = Environment;
