const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

/**
 * Menghapus slash di akhir URL supaya penggabungan path tidak menghasilkan "//".
 */
function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

/**
 * Skema environment variable. Nilai kosong ("") dianggap tidak diisi,
 * supaya baris seperti `OPENAI_API_KEY=` di .env tidak dianggap sebagai key.
 */
const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default("*"),
  // Token bersama dengan backend-core. Kosong berarti endpoint tidak memerlukan token.
  AI_SERVICE_TOKEN: z.string().default(""),

  DEFAULT_PROVIDER: z
    .enum(["ollama", "openai", "huggingface"])
    .default("ollama"),

  OLLAMA_URL: z
    .string()
    .url()
    .default("http://localhost:11434")
    .transform(stripTrailingSlash),
  OLLAMA_MODEL: z.string().default("llama3.1"),

  // Provider kompatibel OpenAI (Groq, Cerebras, OpenRouter, Mistral, dll.).
  OPENAI_BASE_URL: z
    .string()
    .url()
    .default("https://api.groq.com/openai/v1")
    .transform(stripTrailingSlash),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL: z.string().default("llama-3.1-8b-instant"),

  HUGGINGFACE_API_TOKEN: z.string().default(""),
  HUGGINGFACE_MODEL: z.string().default("gpt2"),
  HUGGINGFACE_API_URL: z
    .string()
    .url()
    .default("https://api-inference.huggingface.co/models")
    .transform(stripTrailingSlash),
});

/**
 * Memvalidasi process.env sekali saat startup. Jika ada yang salah,
 * semua masalah dicetak lalu proses dihentikan agar tidak berjalan dengan konfigurasi rusak.
 */
function loadEnvironment() {
  const rawEnvironment = {};

  for (const key of Object.keys(environmentSchema.shape)) {
    const value = process.env[key];

    if (value !== undefined && value !== "") {
      rawEnvironment[key] = value;
    }
  }

  const result = environmentSchema.safeParse(rawEnvironment);

  if (!result.success) {
    console.error("Invalid environment configuration:");

    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }

    process.exit(1);
  }

  return result.data;
}

const config = loadEnvironment();

/**
 * Semua konfigurasi service dibaca dari environment variable di satu tempat,
 * sehingga file lain tidak perlu membaca process.env secara langsung.
 */
class Environment {
  static get nodeEnv() {
    return config.NODE_ENV;
  }

  static get port() {
    return config.PORT;
  }

  static get corsOrigin() {
    return config.CORS_ORIGIN;
  }

  static get aiServiceToken() {
    return config.AI_SERVICE_TOKEN;
  }

  static get aiProvider() {
    return config.DEFAULT_PROVIDER;
  }

  static get ollamaUrl() {
    return config.OLLAMA_URL;
  }

  static get ollamaModel() {
    return config.OLLAMA_MODEL;
  }

  static get openAiBaseUrl() {
    return config.OPENAI_BASE_URL;
  }

  static get openAiApiKey() {
    return config.OPENAI_API_KEY;
  }

  static get openAiModel() {
    return config.OPENAI_MODEL;
  }

  static get huggingFaceToken() {
    return config.HUGGINGFACE_API_TOKEN;
  }

  static get huggingFaceModel() {
    return config.HUGGINGFACE_MODEL;
  }

  static get huggingFaceApiUrl() {
    return config.HUGGINGFACE_API_URL;
  }

  /**
   * Nama model yang sedang aktif, mengikuti DEFAULT_PROVIDER. Dipakai oleh /api/health.
   */
  static get activeModel() {
    if (config.DEFAULT_PROVIDER === "openai") {
      return config.OPENAI_MODEL;
    }

    if (config.DEFAULT_PROVIDER === "huggingface") {
      return config.HUGGINGFACE_MODEL;
    }

    return config.OLLAMA_MODEL;
  }
}

module.exports = Environment;
