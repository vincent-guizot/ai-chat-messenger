const axios = require("axios");
const Environment = require("../config/environment");

// Model AI bisa lambat (terutama Ollama di CPU), jadi timeout-nya dibuat panjang.
const REQUEST_TIMEOUT_MS = 120000;

/**
 * Client HTTP ke service AI (backend-aichat).
 * Service core tidak lagi berbicara langsung ke Ollama / OpenAI / Hugging Face;
 * semua pemanggilan model dilakukan oleh backend-aichat lewat endpoint ini:
 *
 *   POST {AI_SERVICE_URL}/api/ai/reply
 *   body     { messages: [{ role: "user" | "assistant", content }] }
 *   response { ok: true, text, provider, model }
 */
class AiChatClient {
  /**
   * Meminta balasan AI untuk riwayat percakapan `chatMessages`.
   * Mengembalikan { text, provider, model }, atau melempar Error dengan pesan
   * yang mudah dibaca jika service AI tidak bisa dihubungi / menjawab error.
   */
  static async reply(chatMessages) {
    const url = `${Environment.aiServiceUrl}/api/ai/reply`;
    const requestBody = { messages: chatMessages };

    const requestOptions = {
      headers: AiChatClient.buildHeaders(),
      timeout: REQUEST_TIMEOUT_MS,
      // Status 4xx/5xx tidak dilempar oleh axios, supaya pesan error dari service bisa dibaca.
      validateStatus: () => true,
    };

    let response;

    try {
      response = await axios.post(url, requestBody, requestOptions);
    } catch (error) {
      throw new Error(AiChatClient.describeNetworkError(error));
    }

    const data = response.data;

    if (!data || data.ok !== true) {
      throw new Error(AiChatClient.describeFailedResponse(response));
    }

    if (typeof data.text !== "string") {
      throw new Error("AI service returned an invalid response");
    }

    return { text: data.text, provider: data.provider, model: data.model };
  }

  /**
   * Header Authorization hanya dikirim jika AI_SERVICE_TOKEN diisi.
   * Token ini harus sama dengan yang dikonfigurasi di backend-aichat.
   */
  static buildHeaders() {
    const headers = {};
    const token = Environment.aiServiceToken;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Response diterima tetapi ok-nya bukan true: pakai pesan error dari service jika ada.
   */
  static describeFailedResponse(response) {
    const data = response.data;

    if (data && typeof data.error === "string" && data.error !== "") {
      return `AI service error: ${data.error}`;
    }

    return `AI service error (HTTP ${response.status})`;
  }

  /**
   * Tidak ada response sama sekali (koneksi ditolak, DNS gagal, timeout, dll.).
   */
  static describeNetworkError(error) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "AI service timed out";
    }

    return "AI service unavailable";
  }
}

module.exports = AiChatClient;
