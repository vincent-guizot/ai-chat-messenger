const Environment = require('../config/environment');

class HealthController {
  /**
   * GET /api/health
   * Menampilkan provider & model yang sedang aktif agar mudah dicek dari luar.
   */
  static check(request, response) {
    return response.json({
      ok: true,
      service: 'aichat',
      provider: Environment.aiProvider,
      model: Environment.activeModel,
    });
  }
}

module.exports = HealthController;
