const AiProviderService = require('../services/AiProviderService');
const HttpError = require('../utils/HttpError');

class AiController {
  /**
   * POST /api/ai/reply
   * Body: { messages: [{ role, content }] } (sudah divalidasi oleh replySchema)
   * Response: { ok: true, text, provider, model }
   */
  static async reply(request, response, next) {
    try {
      const messages = request.body.messages;

      let result;

      try {
        result = await AiProviderService.generate(messages);
      } catch (error) {
        const providerMessage = AiController.describeProviderError(error);

        // Kuota / rate limit provider habis (HTTP 429). User cukup diberi tahu bahwa kuota
        // habis; detail angkanya (limit, terpakai, kapan reset) hanya ditulis ke log untuk developer.
        if (AiController.isQuotaExceeded(error)) {
          const retryAfter = AiController.readRetryAfterSeconds(error);

          console.error(
            `[ai:quota] limit habis: ${providerMessage}` + (retryAfter ? ` (retry-after: ${retryAfter}s)` : '')
          );

          const extra = { code: 'ai_quota_exceeded' };

          if (retryAfter) {
            extra.retryAfter = retryAfter;
          }

          throw HttpError.tooManyRequests('AI quota exhausted, please try again later', extra);
        }

        // Kegagalan provider lainnya bukan kesalahan client maupun bug service ini,
        // jadi dilaporkan sebagai 502 dengan pesan yang bisa ditampilkan ke user.
        console.error('[ai:reply] provider error:', error.message);
        throw HttpError.badGateway(providerMessage);
      }

      return response.json({
        ok: true,
        text: result.text,
        provider: result.provider,
        model: result.model,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Provider membalas HTTP 429 saat rate limit / kuota habis (Groq, OpenRouter, Hugging Face, dll.).
   */
  static isQuotaExceeded(error) {
    return Boolean(error.response && error.response.status === 429);
  }

  /**
   * Header "retry-after" (detik) dikirim Groq hanya saat 429. Mengembalikan null jika tidak ada.
   */
  static readRetryAfterSeconds(error) {
    const headers = error.response && error.response.headers;

    if (!headers || headers['retry-after'] === undefined) {
      return null;
    }

    const seconds = Number(headers['retry-after']);

    if (!Number.isFinite(seconds) || seconds < 0) {
      return null;
    }

    return Math.ceil(seconds);
  }

  /**
   * Mengambil pesan error yang paling informatif dari error axios / Error biasa.
   * Provider kompatibel OpenAI biasanya mengirim { error: { message } } saat gagal.
   */
  static describeProviderError(error) {
    const providerResponse = error.response;

    if (providerResponse && providerResponse.data) {
      const data = providerResponse.data;

      if (data.error && typeof data.error.message === 'string') {
        return data.error.message;
      }

      if (typeof data.error === 'string') {
        return data.error;
      }
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'AI provider timed out';
    }

    if (error.message) {
      return error.message;
    }

    return 'generation failed';
  }
}

module.exports = AiController;
