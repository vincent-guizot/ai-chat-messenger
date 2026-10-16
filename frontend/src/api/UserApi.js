import ApiClient from './ApiClient';

class UserApi {
  /**
   * Daftar kontak (semua user lain) beserta status online.
   */
  static async getContacts() {
    const data = await ApiClient.get('/api/users');
    return data.users || [];
  }

  static async getMe() {
    const data = await ApiClient.get('/api/users/me');
    return data.user;
  }
}

export default UserApi;
