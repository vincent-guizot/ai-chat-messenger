const { PrismaClient } = require('@prisma/client');

require('./environment');

/**
 * Satu instance PrismaClient dipakai bersama oleh seluruh aplikasi.
 */
const prisma = new PrismaClient();

module.exports = prisma;
