const axios = require('axios');
require('dotenv').config();

async function generateWithHuggingFace(prompt, options = {}) {
  const model = options.model || process.env.DEFAULT_HF_MODEL || 'gpt2';
  const token = process.env.HUGGINGFACE_API_TOKEN;

  if (!token) throw new Error('HUGGINGFACE_API_TOKEN not set in env');

  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: options.max_new_tokens || 512,
      },
      options: {
        wait_for_model: true,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 120000,
    }
  );

  if (Array.isArray(response.data) && response.data[0]?.generated_text) return response.data[0].generated_text;
  if (response.data?.generated_text) return response.data.generated_text;
  if (typeof response.data === 'string') return response.data;
  return JSON.stringify(response.data);
}

async function generateWithOllama(prompt, options = {}) {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const response = await axios.post(
    `${baseUrl}/api/generate`,
    {
      model: options.model || 'llama3.1',
      prompt,
      stream: false,
      options: {
        num_predict: options.max_new_tokens || 512,
      },
    },
    {
      timeout: 120000,
    }
  );

  if (response.data?.response) return response.data.response;
  if (response.data?.results?.[0]?.content) return response.data.results[0].content;
  return JSON.stringify(response.data);
}

module.exports = { generateWithHuggingFace, generateWithOllama };
