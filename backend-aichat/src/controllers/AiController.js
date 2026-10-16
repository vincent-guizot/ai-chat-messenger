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
        // Kegagalan provider bukan kesalahan client maupun bug service ini,
        // jadi dilaporkan sebagai 502 dengan pesan yang bisa ditampilkan ke user.
        console.error('[ai:reply] provider error:', error.message);
        throw HttpError.badGateway(AiController.describeProviderError(error));
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
