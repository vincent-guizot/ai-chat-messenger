const getTestDatabaseUrl = require('./testDatabaseUrl');

// Dijalankan sebelum setiap file test, sebelum PrismaClient dibuat.
process.env.DATABASE_URL = getTestDatabaseUrl();
