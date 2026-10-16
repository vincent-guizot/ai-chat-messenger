import ApiClient from './ApiClient';

class AuthApi {
  /**
   * Mengembalikan { token, user }.
   */
  static login(credentials) {
    return ApiClient.post('/api/auth/login', credentials);
  }

  static signup(credentials) {
    return ApiClient.post('/api/auth/signup', credentials);
  }
}

export default AuthApi;
