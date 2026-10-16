class HealthController {
  /**
   * GET /api/health
   */
  static check(request, response) {
    return response.json({ ok: true });
  }
}

module.exports = HealthController;
