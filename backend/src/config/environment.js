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
