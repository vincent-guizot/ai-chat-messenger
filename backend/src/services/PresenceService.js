/**
 * Mencatat user yang sedang online (memiliki minimal satu koneksi socket aktif).
 *
 * Satu user bisa membuka beberapa tab sekaligus, jadi yang dihitung adalah
 * jumlah koneksi per user. User dianggap offline saat koneksinya habis.
 *
 * Data disimpan di memori, sehingga cukup untuk satu instance server.
 */
const connectionCountByUserId = new Map();

class PresenceService {
  /**
   * Mengembalikan true jika ini koneksi pertama user tersebut (baru saja online).
   */
  static addConnection(userId) {
    const currentCount = connectionCountByUserId.get(userId) || 0;
    connectionCountByUserId.set(userId, currentCount + 1);

    return currentCount === 0;
  }

  /**
   * Mengembalikan true jika ini koneksi terakhir user tersebut (baru saja offline).
   */
  static removeConnection(userId) {
    const currentCount = connectionCountByUserId.get(userId) || 0;

    if (currentCount <= 1) {
      connectionCountByUserId.delete(userId);
      return true;
    }

    connectionCountByUserId.set(userId, currentCount - 1);
    return false;
  }

  static isOnline(userId) {
    return connectionCountByUserId.has(userId);
  }

  static getOnlineUserIds() {
    return Array.from(connectionCountByUserId.keys());
  }

  /**
   * Dipakai oleh test untuk memulai dari kondisi kosong.
   */
  static reset() {
    connectionCountByUserId.clear();
  }
}

module.exports = PresenceService;
