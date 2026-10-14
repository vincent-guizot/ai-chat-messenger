const UserService = require('../services/UserService');
const TokenService = require('../services/TokenService');
const NotificationService = require('../services/NotificationService');
const HttpError = require('../utils/HttpError');

class AuthController {
  /**
   * POST /api/auth/signup
   * Body: { email, password, name? }
   */
  static async signup(request, response, next) {
    try {
      const email = request.body.email;
      const password = request.body.password;
      let name = request.body.name;

      if (!email || !password) {
        throw HttpError.badRequest('email and password required');
      }

      const existingUser = await UserService.findByEmail(email);

      if (existingUser) {
        throw HttpError.badRequest('email already in use');
      }

      if (!name) {
        name = email.split('@')[0];
      }

      const user = await UserService.createUser(email, password, name);
      const token = TokenService.createToken(user);

      await NotificationService.create({
        userId: user.id,
        type: NotificationService.TYPES.system,
        title: 'Welcome to AI Chat Messenger',
        body: 'Start a chat with the AI Assistant, or find someone online in Contacts.',
      });

      return response.json({
        ok: true,
        token: token,
        user: UserService.toPublicUser(user),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  static async login(request, response, next) {
    try {
      const email = request.body.email;
      const password = request.body.password;

      if (!email || !password) {
        throw HttpError.badRequest('email and password required');
      }

      const user = await UserService.findByEmail(email);

      if (!user) {
        throw HttpError.badRequest('invalid credentials');
      }

      const passwordIsCorrect = await UserService.isPasswordCorrect(user, password);

      if (!passwordIsCorrect) {
        throw HttpError.badRequest('invalid credentials');
      }

      const token = TokenService.createToken(user);

      return response.json({
        ok: true,
        token: token,
        user: UserService.toPublicUser(user),
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AuthController;
