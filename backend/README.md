# Backend README

This backend provides a small Express API to proxy chat requests to an AI provider.

Providers supported:
- Hugging Face Inference API (hosted, free tier available)
- Ollama (local server) — recommended if you want large context and free usage (runs locally)

Environment
- Copy backend/.env.example to backend/.env and set values.
  - HUGGINGFACE_API_TOKEN: your HF token (if using Hugging Face)
  - DEFAULT_PROVIDER: 'huggingface' or 'ollama'
  - DEFAULT_HF_MODEL: model id on HF (eg. 'gpt2', 'bigscience/bloom', 'TheBloke/wizardLM')
  - OLLAMA_URL: e.g. http://localhost:11434

Endpoints
- POST /api/chat
  - body: { messages: [{role:'user'|'assistant', content: string}], provider?: 'huggingface'|'ollama', model?: string, max_new_tokens?: number }

Notes on "gratisan dan banyak token":
- Hugging Face: has a free tier for inference; tokens/limits vary by model and rate limits — good for quick hosted testing.
- Ollama (local): run models locally (e.g., llama.cpp/ggml builds or models from Hugging Face). Token limits depend on the model and your machine — this is the best way to get large context without per-token billing, but requires local resources.

