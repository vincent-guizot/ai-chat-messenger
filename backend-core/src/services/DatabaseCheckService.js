const prisma = require("../../prisma/prisma");

// Kode error Prisma: https://www.prisma.io/docs/orm/reference/error-reference
const TABLE_DOES_NOT_EXIST = "P2021";
const CANNOT_REACH_DATABASE = "P1001";
const DATABASE_DOES_NOT_EXIST = "P1003";

// Database managed (mis. Neon free tier) "tidur" saat idle dan butuh beberapa detik untuk bangun,
// jadi koneksi pertama dicoba ulang beberapa kali sebelum menyerah.
const CONNECT_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

class DatabaseCheckService {
  /**
   * Memastikan database bisa diakses dan tabel sudah dibuat oleh migrasi.
   * Jika belum, menampilkan pesan yang jelas lalu menghentikan server.
   */
  static async ensureReady() {
    let lastError = null;

    for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt += 1) {
      try {
        await prisma.user.count();
        return;
      } catch (error) {
        lastError = error;

        // Tabel belum ada bukan masalah koneksi; mencoba ulang tidak akan membantu.
        if (error.code === TABLE_DOES_NOT_EXIST) {
          break;
        }

        if (attempt < CONNECT_ATTEMPTS) {
          console.warn(
            `[Database] Belum bisa terhubung (percobaan ${attempt}/${CONNECT_ATTEMPTS}), ` +
              `mencoba lagi dalam ${RETRY_DELAY_MS / 1000} detik...`,
          );
          await wait(RETRY_DELAY_MS);
        }
      }
    }

    console.error(
      "\n[Database] " + DatabaseCheckService.describeError(lastError) + "\n",
    );
    console.error("Detail:", lastError.message);
    process.exit(1);
  }

  static describeError(error) {
    if (error.code === TABLE_DOES_NOT_EXIST) {
      return "Tabel belum ada. Jalankan: npm run db:migrate";
    }

    if (error.code === DATABASE_DOES_NOT_EXIST) {
      return "Database belum ada. Jalankan: npm run db:setup";
    }

    if (error.code === CANNOT_REACH_DATABASE) {
      return "Tidak bisa terhubung ke PostgreSQL. Pastikan PostgreSQL berjalan dan DATABASE_URL di .env benar.";
    }

    return "Gagal mengakses database. Periksa DATABASE_URL di .env.";
  }
}

module.exports = DatabaseCheckService;
