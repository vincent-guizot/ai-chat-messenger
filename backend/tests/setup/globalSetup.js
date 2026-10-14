const path = require('path');
const { execSync } = require('child_process');
const createDatabaseIfMissing = require('../../scripts/create-database');
const getTestDatabaseUrl = require('./testDatabaseUrl');

/**
 * Dijalankan sekali sebelum semua test:
 * membuat database test (jika belum ada) lalu menjalankan migrasi Prisma.
 */
module.exports = async function globalSetup() {
  const testDatabaseUrl = getTestDatabaseUrl();

  await createDatabaseIfMissing(testDatabaseUrl);

  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..', '..'),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'ignore',
  });
};
