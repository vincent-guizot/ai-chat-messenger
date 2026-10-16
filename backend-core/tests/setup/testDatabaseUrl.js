require('dotenv').config();

/**
 * URL database khusus test.
 * Memakai TEST_DATABASE_URL jika ada, jika tidak memakai DATABASE_URL dengan akhiran "_test",
 * agar test (yang menghapus data) tidak menyentuh database development.
 */
function getTestDatabaseUrl() {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  const baseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_chat?schema=public';
  const parsedUrl = new URL(baseUrl);
  const databaseName = parsedUrl.pathname.replace('/', '');

  parsedUrl.pathname = `/${databaseName}_test`;

  return parsedUrl.toString();
}

module.exports = getTestDatabaseUrl;
