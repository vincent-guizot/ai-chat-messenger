const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { generateWithHuggingFace, generateWithOllama } = require('./ai/providers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, provider, model, max_new_tokens } = req.body;

    // Construct prompt from messages (simple concatenation; replace with a better prompt template as needed)
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

app.listen(PORT, () => {
  console.log(`AI Chat Messenger backend listening on http://localhost:${PORT}`);
});
