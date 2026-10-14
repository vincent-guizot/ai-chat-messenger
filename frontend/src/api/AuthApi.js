import ApiClient from './ApiClient';

class AuthApi {
  static login(credentials) {
    return ApiClient.post('/api/auth/login', credentials);
  }

  static signup(credentials) {
    return ApiClient.post('/api/auth/signup', credentials);
  }
}

export default AuthApi;
