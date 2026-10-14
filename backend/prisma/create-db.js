#!/usr/bin/env node
const { Client } = require('pg');
require('dotenv').config();

(async function createDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_chat';
    const parsed = new URL(databaseUrl);
    const dbName = parsed.pathname.replace('/', '');

    // connect to default postgres database
    const adminUrl = new URL(databaseUrl);
    adminUrl.pathname = '/postgres';

    const client = new Client({ connectionString: adminUrl.toString() });
    await client.connect();

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE \"${dbName}\"`);
      console.log('Database created');
    } else {
      console.log(`Database ${dbName} already exists`);
    }

    await client.end();
  } catch (err) {
    console.error('Error creating database:', err.message || err);
    process.exit(1);
  }
})();
