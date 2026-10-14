const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const prisma = require('./prisma');
const authRouter = require('./routes/auth');
const { generateWithHuggingFace, generateWithOllama } = require('./ai/providers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

// Basic REST endpoints for conversations/messages (protected via middleware in routes if needed)
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Create HTTP server and attach socket.io for real-time chat
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Simple socket auth helper
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

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, socket.user?.id);

  socket.on('join', async ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
    // Optional: emit presence
  });

  socket.on('leave', ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(conversationId);
  });

  socket.on('message:create', async (payload) => {
    // payload: { conversationId, content }
    try {
      const userId = socket.user?.id || null;
      if (!userId) {
        socket.emit('error', { message: 'unauthenticated' });
        return;
      }

      const { conversationId, content } = payload;
      if (!conversationId || !content) return;

      const message = await prisma.message.create({ data: {
        conversationId,
        senderId: userId,
        senderRole: 'user',
        content,
      }});

      // Emit to room
      io.to(conversationId).emit('message:new', message);

      // If conversation has a bot participant, generate AI response
      const participants = await prisma.participant.findMany({ where: { conversationId } });
      const hasBot = participants.some(p => p.role === 'bot');
      if (hasBot) {
        // build a simple prompt using last 10 messages
        const lastMessages = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'desc' }, take: 10 });
        const prompt = lastMessages.reverse().map(m => `${m.senderRole === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

        const chosenProvider = process.env.DEFAULT_PROVIDER || 'huggingface';
        const chosenModel = process.env.DEFAULT_HF_MODEL || 'gpt2';
        let aiOutput = '';
        try {
          if (chosenProvider === 'ollama') aiOutput = await generateWithOllama(prompt, { model: chosenModel, max_new_tokens: 512 });
          else aiOutput = await generateWithHuggingFace(prompt, { model: chosenModel, max_new_tokens: 512 });
        } catch (err) {
          aiOutput = 'AI error: ' + (err.message || 'generation failed');
        }

        const aiMessage = await prisma.message.create({ data: {
          conversationId,
          senderId: null,
          senderRole: 'assistant',
          content: aiOutput,
          metadata: { provider: chosenProvider, model: chosenModel }
        }});

        io.to(conversationId).emit('message:new', aiMessage);
      }

    } catch (err) {
      console.error('message:create error', err.message || err);
      socket.emit('error', { message: err.message || 'server error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`AI Chat Messenger backend (with sockets & prisma) listening on http://localhost:${PORT}`);
});
