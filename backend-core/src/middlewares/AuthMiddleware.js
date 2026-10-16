const TokenService = require("../services/TokenService");
const UserService = require("../services/UserService");

class AuthMiddleware {
  /**
   * Memastikan request memiliki header "Authorization: Bearer <token>" yang valid
   * DAN user di dalam token masih ada di database. Jika valid, data user disimpan di request.user.
   *
   * Pengecekan ke database penting saat database diganti (mis. pindah ke Neon) atau user dihapus:
   * token lama masih sah secara tanda tangan, tetapi user-nya sudah tidak ada. Tanpa pengecekan ini,
   * request berikutnya gagal dengan 500 (foreign key) alih-alih 401, dan frontend tidak tahu harus logout.
   */
  static async requireAuth(request, response, next) {
    const authorizationHeader = request.headers.authorization || "";
    const bearerPrefix = "Bearer ";

    if (!authorizationHeader.startsWith(bearerPrefix)) {
      return response.status(401).json({ ok: false, error: "missing token" });
    }

    const token = authorizationHeader.slice(bearerPrefix.length);
    let tokenUser;

    try {
      tokenUser = TokenService.verifyToken(token);
    } catch (error) {
      return response.status(401).json({ ok: false, error: "invalid token" });
    }

    try {
      const user = await UserService.findById(tokenUser.id);

      if (!user) {
        return response
          .status(401)
          .json({ ok: false, error: "user not found" });
      }

      request.user = { id: user.id, email: user.email };
      return next();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AuthMiddleware;
