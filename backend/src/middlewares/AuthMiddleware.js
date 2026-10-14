const TokenService = require('../services/TokenService');

class AuthMiddleware {
  /**
   * Memastikan request memiliki header "Authorization: Bearer <token>" yang valid.
   * Jika valid, data user disimpan di request.user.
   */
  static requireAuth(request, response, next) {
    const authorizationHeader = request.headers.authorization || '';
    const bearerPrefix = 'Bearer ';

    if (!authorizationHeader.startsWith(bearerPrefix)) {
      return response.status(401).json({ ok: false, error: 'missing token' });
    }

    const token = authorizationHeader.slice(bearerPrefix.length);

    try {
      request.user = TokenService.verifyToken(token);
      return next();
    } catch (error) {
      return response.status(401).json({ ok: false, error: 'invalid token' });
    }
  }
}

module.exports = AuthMiddleware;
