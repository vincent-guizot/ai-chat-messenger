const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "replace_this");
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }
}

module.exports = { requireAuth };
