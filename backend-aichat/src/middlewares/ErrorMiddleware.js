const HttpError = require("../utils/HttpError");

class ErrorMiddleware {
  /**
   * Dipanggil ketika tidak ada route yang cocok.
   */
  static notFound(request, response) {
    return response.status(404).json({ ok: false, error: "route not found" });
  }

  /**
   * Penanganan error terpusat untuk seluruh controller.
   * Express mengenali error handler dari jumlah parameternya (4), jadi "next" wajib ada.
   */
  // eslint-disable-next-line no-unused-vars
  static handle(error, request, response, next) {
    if (error instanceof HttpError) {
      return response
        .status(error.statusCode)
        .json({ ok: false, error: error.message, ...error.extra });
    }

    // Body JSON yang rusak (dilempar express.json) adalah kesalahan client, bukan server.
    if (error.type === "entity.parse.failed") {
      return response
        .status(400)
        .json({ ok: false, error: "invalid JSON body" });
    }

    console.error(`[${request.method} ${request.originalUrl}]`, error);

    return response
      .status(500)
      .json({ ok: false, error: "internal server error" });
  }
}

module.exports = ErrorMiddleware;
