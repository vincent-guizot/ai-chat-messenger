const HttpError = require('../utils/HttpError');

class ValidationMiddleware {
  /**
   * Memvalidasi request.body dengan skema zod.
   * Jika valid, request.body diganti dengan hasil parse (sudah bersih dan ada nilai default-nya).
   * Jika tidak, pesan issue pertama dikirim sebagai 400 lewat ErrorMiddleware.
   */
  static validateBody(schema) {
    return function validateBodyHandler(request, response, next) {
      const result = schema.safeParse(request.body);

      if (!result.success) {
        return next(HttpError.badRequest(ValidationMiddleware.firstIssueMessage(result.error)));
      }

      request.body = result.data;

      return next();
    };
  }

  /**
   * Memvalidasi request.params (bagian URL seperti :id) dengan skema zod.
   */
  static validateParams(schema) {
    return function validateParamsHandler(request, response, next) {
      const result = schema.safeParse(request.params);

      if (!result.success) {
        return next(HttpError.badRequest(ValidationMiddleware.firstIssueMessage(result.error)));
      }

      request.params = result.data;

      return next();
    };
  }

  /**
   * Hanya issue pertama yang dikirim ke client agar pesan error tetap singkat dan jelas.
   */
  static firstIssueMessage(zodError) {
    const firstIssue = zodError.issues[0];

    if (firstIssue && firstIssue.message) {
      return firstIssue.message;
    }

    return 'invalid request';
  }
}

module.exports = ValidationMiddleware;
