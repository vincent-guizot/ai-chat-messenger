const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/prisma');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'email and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ ok: false, error: 'email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name: name || email.split('@')[0] } });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'replace_this', { expiresIn: '7d' });

    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ ok: false, error: 'internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ ok: false, error: 'invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ ok: false, error: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'replace_this', { expiresIn: '7d' });

    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ ok: false, error: 'internal server error' });
  }
});

module.exports = router;
