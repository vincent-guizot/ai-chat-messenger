const { PrismaClient } = require("@prisma/client");

// Memuat .env lebih dulu agar DATABASE_URL tersedia saat PrismaClient dibuat.
require("../src/config/environment");

/**
 * Satu instance PrismaClient dipakai bersama oleh seluruh aplikasi.
 */
const prisma = new PrismaClient();

module.exports = prisma;
