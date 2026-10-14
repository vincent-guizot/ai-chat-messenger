/**
 * Error dengan HTTP status code.
 * Dilempar dari service/controller lalu ditangani oleh ErrorMiddleware.
 */
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }

  static badRequest(message) {
    return new HttpError(400, message);
  }

  static unauthorized(message) {
    return new HttpError(401, message);
  }

  static forbidden(message) {
    return new HttpError(403, message);
  }

  static notFound(message) {
    return new HttpError(404, message);
  }
}

module.exports = HttpError;
