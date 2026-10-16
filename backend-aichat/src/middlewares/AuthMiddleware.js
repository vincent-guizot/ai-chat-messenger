const Environment = require('../config/environment');

class AuthMiddleware {
  /**
   * Memastikan request dari backend-core membawa token bersama yang sama
   * ("Authorization: Bearer <AI_SERVICE_TOKEN>").
   * Jika AI_SERVICE_TOKEN tidak diisi, semua request diizinkan (mis. development lokal).
   */
  static requireServiceToken(request, response, next) {
    const expectedToken = Environment.aiServiceToken;

    if (!expectedToken) {
      return next();
    }

    const authorizationHeader = request.headers.authorization || '';
    const bearerPrefix = 'Bearer ';

    if (!authorizationHeader.startsWith(bearerPrefix)) {
      return response.status(401).json({ ok: false, error: 'missing token' });
    }

    const token = authorizationHeader.slice(bearerPrefix.length);

    if (token !== expectedToken) {
      return response.status(401).json({ ok: false, error: 'invalid token' });
    }

    return next();
  }
}

module.exports = AuthMiddleware;
