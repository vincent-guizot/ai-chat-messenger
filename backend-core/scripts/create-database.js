#!/usr/bin/env node
/**
 * Membuat database PostgreSQL dari DATABASE_URL jika belum ada.
 *
 * Pemakaian:
 *   node scripts/create-database.js                  -> pakai DATABASE_URL dari .env
 *   node scripts/create-database.js <connection-url> -> pakai URL yang diberikan
 */
const { Client } = require('pg');

require('dotenv').config();

const FALLBACK_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ai_chat';

async function createDatabaseIfMissing(databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  const databaseName = parsedUrl.pathname.replace('/', '');

  // Terhubung ke database bawaan "postgres" untuk bisa menjalankan CREATE DATABASE.
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  adminUrl.search = '';

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);

    if (result.rowCount === 0) {
      console.log(`Creating database "${databaseName}"...`);
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log('Database created.');
    } else {
      console.log(`Database "${databaseName}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL || FALLBACK_DATABASE_URL;

  createDatabaseIfMissing(databaseUrl).catch((error) => {
    console.error('Error creating database:', error.message);
    process.exit(1);
  });
}

module.exports = createDatabaseIfMissing;
