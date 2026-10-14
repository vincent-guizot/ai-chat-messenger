const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { generateWithHuggingFace, generateWithOllama } = require('./ai/providers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, provider, model, max_new_tokens } = req.body;

    const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

    const chosenProvider = provider || process.env.DEFAULT_PROVIDER || 'huggingface';
    const chosenModel = model || process.env.DEFAULT_HF_MODEL || 'gpt2';

    let result;
    if (chosenProvider === 'ollama') {
      result = await generateWithOllama(prompt, { model: chosenModel, max_new_tokens });
    } else {
      result = await generateWithHuggingFace(prompt, { model: chosenModel, max_new_tokens });
    }

    res.json({ ok: true, provider: chosenProvider, model: chosenModel, output: result });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    res.status(500).json({ ok: false, error: err?.response?.data || err.message || 'internal error' });
  }
});

// Create HTTP server and attach socket.io for real-time chat
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('chat:message', async (payload) => {
    // payload: { messages: [{role, content}], provider?, model?, max_new_tokens? }
    try {
      const { messages, provider, model, max_new_tokens } = payload;
      const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';
      const chosenProvider = provider || process.env.DEFAULT_PROVIDER || 'huggingface';
      const chosenModel = model || process.env.DEFAULT_HF_MODEL || 'gpt2';

      let output;
      if (chosenProvider === 'ollama') {
        output = await generateWithOllama(prompt, { model: chosenModel, max_new_tokens });
      } else {
        output = await generateWithHuggingFace(prompt, { model: chosenModel, max_new_tokens });
      }

      socket.emit('chat:response', { ok: true, provider: chosenProvider, model: chosenModel, output });
    } catch (err) {
      console.error('chat error', err?.response?.data || err.message || err);
      socket.emit('chat:response', { ok: false, error: err?.response?.data || err.message || 'internal error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`AI Chat Messenger backend (with sockets) listening on http://localhost:${PORT}`);
});
