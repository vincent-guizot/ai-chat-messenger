# AI Chat Messenger

Project skeleton: frontend (React + Vite) and backend (Node + Express) with pluggable AI provider support.

Quick start

1. Backend
   - cd backend
   - copy .env.example to .env and set HUGGINGFACE_API_TOKEN or run a local Ollama instance
   - npm install
   - npm run dev

2. Frontend
   - cd frontend
   - npm install
   - npm run dev

Providers
- Hugging Face Inference API (recommended for quick hosted/free usage)
- Ollama (local) — run a local model for large context / many tokens

See backend/README.md for details.
