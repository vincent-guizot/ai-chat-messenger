const axios = require('axios');
require('dotenv').config();

async function generateWithHuggingFace(prompt, options = {}) {
  const model = options.model || process.env.DEFAULT_HF_MODEL || 'gpt2';
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) throw new Error('HUGGINGFACE_API_TOKEN not set in env');

  const url = `https://api-inference.huggingface.co/models/${model}`;
  const payload = { inputs: prompt, parameters: { max_new_tokens: options.max_new_tokens || 512 }, options: { wait_for_model: true } };
  const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` }, timeout: 120000 });

  if (Array.isArray(resp.data) && resp.data[0]?.generated_text) return resp.data[0].generated_text;
  if (resp.data.generated_text) return resp.data.generated_text;
  if (typeof resp.data === 'string') return resp.data;
  return JSON.stringify(resp.data);
}

async function generateWithOllama(prompt, options = {}) {
  const url = `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`;
  const payload = { model: options.model || 'llama3.1', prompt, stream: false, options: { num_predict: options.max_new_tokens || 512 } };
  const resp = await axios.post(url, payload, { timeout: 120000 });
  if (resp.data?.response) return resp.data.response;
  if (resp.data?.results?.[0]?.content) return resp.data.results[0].content;
  return JSON.stringify(resp.data);
}

module.exports = { generateWithHuggingFace, generateWithOllama };
