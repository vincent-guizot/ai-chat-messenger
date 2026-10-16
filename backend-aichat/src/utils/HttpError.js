/**
 * Error dengan HTTP status code.
 * Dilempar dari service/controller lalu ditangani oleh ErrorMiddleware.
 */
class HttpError extends Error {
  /**
   * `extra` (opsional) berisi field tambahan yang ikut dikirim ke client,
   * misalnya { code: 'ai_quota_exceeded' } supaya pemanggil bisa membedakan jenis error.
   */
  constructor(statusCode, message, extra) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.extra = extra || {};
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

  // Dipakai ketika provider AI di belakang service ini gagal menjawab.
  static badGateway(message) {
    return new HttpError(502, message);
  }

  // Dipakai ketika kuota / rate limit provider AI habis (HTTP 429 dari provider).
  static tooManyRequests(message, extra) {
    return new HttpError(429, message, extra);
  }
}

module.exports = HttpError;
