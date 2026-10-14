const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

async function ensureAssistantUser() {
  const assistant = await prisma.user.findUnique({ where: { email: 'assistant@ai-chat.local' } });
  if (assistant) return assistant;
  return prisma.user.create({ data: { email: 'assistant@ai-chat.local', name: 'AI Assistant', passwordHash: 'ai-bot-placeholder' } });
}

router.get('/', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      orderBy: { updatedAt: 'desc' },
      include: { participants: { include: { user: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    return res.json({ ok: true, conversations });
  } catch (err) {
    console.error('list conversations error', err);
    return res.status(500).json({ ok: false, error: 'internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type = 'dm', title, participantIds = [], withAi = false } = req.body;
    if (!Array.isArray(participantIds)) return res.status(400).json({ ok: false, error: 'participantIds must be an array' });

    const conversation = await prisma.conversation.create({
      data: {
        type,
        title: title || 'New chat',
        createdById: req.user.id,
        participants: { create: [{ userId: req.user.id, role: 'member' }, ...participantIds.map((id) => ({ userId: id, role: 'member' }))] },
      },
      include: { participants: { include: { user: true } } },
    });

    if (withAi) {
      const assistant = await ensureAssistantUser();
      await prisma.participant.create({ data: { conversationId: conversation.id, userId: assistant.id, role: 'assistant' } });
      await prisma.message.create({ data: { conversationId: conversation.id, senderId: assistant.id, senderRole: 'assistant', content: 'Halo! Saya AI Assistant. Ada yang bisa saya bantu?', metadata: { provider: 'assistant', model: 'system' } } });
    }

    return res.json({ ok: true, conversation });
  } catch (err) {
    console.error('create conversation error', err);
    return res.status(500).json({ ok: false, error: 'internal server error' });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const participant = await prisma.participant.findFirst({ where: { conversationId: req.params.id, userId: req.user.id } });
    if (!participant) return res.status(403).json({ ok: false, error: 'not allowed' });

    const messages = await prisma.message.findMany({ where: { conversationId: req.params.id }, orderBy: { createdAt: 'asc' } });
    return res.json({ ok: true, messages });
  } catch (err) {
    console.error('load messages error', err);
    return res.status(500).json({ ok: false, error: 'internal server error' });
  }
});

module.exports = router;
