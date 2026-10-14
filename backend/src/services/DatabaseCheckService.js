const prisma = require('../../prisma/prisma');

// Kode error Prisma: https://www.prisma.io/docs/orm/reference/error-reference
const TABLE_DOES_NOT_EXIST = 'P2021';
const CANNOT_REACH_DATABASE = 'P1001';
const DATABASE_DOES_NOT_EXIST = 'P1003';

class DatabaseCheckService {
  /**
   * Memastikan database bisa diakses dan tabel sudah dibuat oleh migrasi.
   * Jika belum, menampilkan pesan yang jelas lalu menghentikan server.
   */
  static async ensureReady() {
    try {
      await prisma.user.count();
    } catch (error) {
      console.error('\n[Database] ' + DatabaseCheckService.describeError(error) + '\n');
      console.error('Detail:', error.message);
      process.exit(1);
    }
  }

  static describeError(error) {
    if (error.code === TABLE_DOES_NOT_EXIST) {
      return 'Tabel belum ada. Jalankan: npm run db:migrate';
    }

    if (error.code === DATABASE_DOES_NOT_EXIST) {
      return 'Database belum ada. Jalankan: npm run db:setup';
    }

    if (error.code === CANNOT_REACH_DATABASE) {
      return 'Tidak bisa terhubung ke PostgreSQL. Pastikan PostgreSQL berjalan dan DATABASE_URL di .env benar.';
    }

    return 'Gagal mengakses database. Periksa DATABASE_URL di .env.';
  }
}

module.exports = DatabaseCheckService;
