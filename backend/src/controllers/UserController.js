const UserService = require('../services/UserService');

class UserController {
  /**
   * GET /api/users
   * Daftar kontak (semua user lain) beserta status online & lastSeenAt.
   */
  static async index(request, response, next) {
    try {
      const contacts = await UserService.findContacts(request.user.id);

      return response.json({ ok: true, users: contacts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/users/me
   * Data user yang sedang login.
   */
  static async me(request, response, next) {
    try {
      const user = await UserService.findById(request.user.id);

      if (!user) {
        return response.status(404).json({ ok: false, error: 'user not found' });
      }

      return response.json({ ok: true, user: UserService.toPublicUser(user) });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = UserController;
