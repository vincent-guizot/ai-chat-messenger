const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = require('./prisma');
const authRouter = require('./routes/auth');
const conversationsRouter = require('./routes/conversations');
const { generateWithHuggingFace, generateWithOllama } = require('./ai/providers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'replace_this');
    socket.user = { id: payload.sub, email: payload.email };
  } catch (err) {
    console.log('socket auth failed', err.message);
  }

  next();
});

async function maybeGenerateAiReply(conversationId) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  const hasAiParticipant = conversation?.participants.some((p) => p.role === 'assistant');
  if (!hasAiParticipant) return null;

  const recentMessages = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'desc' }, take: 10 });
  const prompt = recentMessages.slice().reverse().map((m) => `${m.senderRole === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

  const chosenProvider = process.env.DEFAULT_PROVIDER || 'ollama';
  const chosenModel = process.env.DEFAULT_HF_MODEL || 'llama3.1';

  try {
    let aiOutput = '';
    if (chosenProvider === 'ollama') {
      aiOutput = await generateWithOllama(prompt, { model: chosenModel, max_new_tokens: 512 });
    } else {
      aiOutput = await generateWithHuggingFace(prompt, { model: chosenModel, max_new_tokens: 512 });
    }

    const aiMessage = await prisma.message.create({ data: { conversationId, senderId: null, senderRole: 'assistant', content: aiOutput, metadata: { provider: chosenProvider, model: chosenModel } } });
    io.to(conversationId).emit('message:new', aiMessage);
    return aiMessage;
  } catch (err) {
    const fallback = `AI error: ${err.message || 'generation failed'}`;
    const aiMessage = await prisma.message.create({ data: { conversationId, senderId: null, senderRole: 'assistant', content: fallback, metadata: { provider: chosenProvider, model: chosenModel, error: true } } });
    io.to(conversationId).emit('message:new', aiMessage);
    return aiMessage;
  }
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, socket.user?.id);

  socket.on('join', ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  socket.on('leave', ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(conversationId);
  });

  socket.on('message:create', async (payload) => {
    try {
      const userId = socket.user?.id;
      if (!userId) { socket.emit('error', { message: 'unauthenticated' }); return; }

      const { conversationId, content } = payload;
      if (!conversationId || !content || !String(content).trim()) return;

      const participant = await prisma.participant.findFirst({ where: { conversationId, userId } });
      if (!participant) { socket.emit('error', { message: 'not a member of this conversation' }); return; }

      const message = await prisma.message.create({ data: { conversationId, senderId: userId, senderRole: 'user', content: String(content).trim() } });
      io.to(conversationId).emit('message:new', message);

      await maybeGenerateAiReply(conversationId);
    } catch (err) {
      console.error('message:create error', err);
      socket.emit('error', { message: err.message || 'server error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

httpServer.listen(PORT, () => { console.log(`AI Chat Messenger backend listening on http://localhost:${PORT}`); });
