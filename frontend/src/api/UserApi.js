import ApiClient from './ApiClient';

class UserApi {
  /**
   * Semua user lain beserta status online & lastSeenAt.
   */
  static async getContacts(token) {
    const data = await ApiClient.get('/api/users', token);
    return data.users || [];
  }
}

export default UserApi;
