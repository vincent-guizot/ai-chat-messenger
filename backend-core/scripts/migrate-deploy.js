#!/usr/bin/env node
/**
 * Menjalankan "prisma migrate deploy".
 *
 * Neon: migrasi sebaiknya lewat koneksi langsung (tanpa pooler/PgBouncer) karena Prisma memakai
 * advisory lock. Jika DATABASE_URL_UNPOOLED diisi, URL itu dipakai khusus untuk migrasi;
 * aplikasi tetap memakai DATABASE_URL (pooled). Jika kosong, DATABASE_URL dipakai seperti biasa.
 */
const { spawnSync } = require("child_process");

require("dotenv").config();

const environment = { ...process.env };

if (process.env.DATABASE_URL_UNPOOLED) {
  environment.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  console.log("[Migrasi] Memakai DATABASE_URL_UNPOOLED (koneksi langsung).");
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: environment,
  shell: process.platform === "win32",
});

process.exit(result.status === null ? 1 : result.status);
