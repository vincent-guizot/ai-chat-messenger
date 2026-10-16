const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const MIN_JWT_SECRET_LENGTH = 16;

/**
 * Skema environment variable. Nilai kosong ("") dianggap tidak diisi,
 * supaya baris seperti `AI_SERVICE_TOKEN=` di .env tidak dianggap sebagai token.
 */
const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  // "*" atau daftar origin dipisah koma, mis. "https://app.vercel.app,https://app-git-main.vercel.app"
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL must be a valid PostgreSQL URL" }),
  JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
  JWT_EXPIRES_IN: z.string().default("7d"),
  AI_SERVICE_URL: z
    .string()
    .url({ message: "AI_SERVICE_URL must be a valid URL" })
    .default("http://localhost:3001")
    // Slash di akhir dibuang supaya penggabungan path tidak menghasilkan "//".
    .transform((value) => value.replace(/\/+$/, "")),
  AI_SERVICE_TOKEN: z.string().default(""),
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
  const problems = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      problems.push(`${issue.path.join(".")}: ${issue.message}`);
    }
  } else if (
    result.data.NODE_ENV === "production" &&
    result.data.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH
  ) {
    // Secret pendek hanya ditolak di production; development dan test boleh memakai nilai sederhana.
    problems.push(
      `JWT_SECRET: must be at least ${MIN_JWT_SECRET_LENGTH} characters in production`,
    );
  }

  if (problems.length > 0) {
    console.error("Invalid environment configuration:");

    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }

    process.exit(1);
  }

  return result.data;
}

const config = loadEnvironment();

/**
 * Semua konfigurasi aplikasi dibaca dari environment variable di satu tempat,
 * sehingga file lain tidak perlu membaca process.env secara langsung.
 */
class Environment {
  static get nodeEnv() {
    return config.NODE_ENV;
  }

  static get port() {
    return config.PORT;
  }

  /**
   * Nilai untuk opsi `origin` di cors / Socket.IO:
   * "*" -> semua origin; selain itu -> array origin (tanpa spasi dan slash di akhir).
   */
  static get corsOrigin() {
    const raw = config.CORS_ORIGIN.trim();

    if (raw === "*" || raw === "") {
      return "*";
    }

    return raw
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter((origin) => origin.length > 0);
  }

  static get databaseUrl() {
    return config.DATABASE_URL;
  }

  static get jwtSecret() {
    return config.JWT_SECRET;
  }

  static get jwtExpiresIn() {
    return config.JWT_EXPIRES_IN;
  }

  // Alamat service AI (backend-aichat), mis. http://localhost:3001
  static get aiServiceUrl() {
    return config.AI_SERVICE_URL;
  }

  // Token bersama untuk service AI; kosong berarti service AI tidak memakai token.
  static get aiServiceToken() {
    return config.AI_SERVICE_TOKEN;
  }
}

module.exports = Environment;
