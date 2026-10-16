const jsonWebToken = require('jsonwebtoken');
const Environment = require('../config/environment');

class TokenService {
  /**
   * Membuat JWT untuk user yang berhasil login / signup.
   */
  static createToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const options = {
      expiresIn: Environment.jwtExpiresIn,
    };

    return jsonWebToken.sign(payload, Environment.jwtSecret, options);
  }

  /**
   * Memverifikasi JWT dan mengembalikan data user yang tersimpan di dalamnya.
   * Melempar error jika token tidak valid atau sudah kedaluwarsa.
   */
  static verifyToken(token) {
    const payload = jsonWebToken.verify(token, Environment.jwtSecret);

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}

module.exports = TokenService;
