# AI Chat Messenger

AI chat messenger app with:

- user-to-user messaging
- AI assistant
- real-time chat using Socket.IO
- PostgreSQL + Prisma persistence
- premium dark gradient UI
- Ollama as default AI backend

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express + Socket.IO
- Database: PostgreSQL + Prisma
- Auth: JWT
- AI: Ollama (recommended) / Hugging Face

## Requirements

- Node.js 18+
- PostgreSQL
- Ollama (recommended)
- npm

## Backend setup

1. Create database:

   ```bash
   psql -U postgres
   CREATE DATABASE ai_chat;
   \q
   ```

2. Create backend/.env:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chat?schema=public
   JWT_SECRET=your_super_secret_key
   DEFAULT_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   PORT=3000
   ```

3. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

4. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

5. Run migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Start backend:
   ```bash
   npm run dev
   ```

## AI setup (recommended: Ollama)

1. Install Ollama
2. Pull model:
   ```bash
   ollama pull llama3.1
   ```

## Frontend setup

1. Create frontend/.env:

   ```env
   VITE_API_BASE=http://localhost:3000
   ```

2. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Start frontend:
   ```bash
   npm run dev
   ```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Features

- Login / signup
- Real-time messaging
- AI assistant room
- Message history in database
- Dark premium UI

## Notes

- For "gratis + banyak token", Ollama is the best option.
- Hugging Face works too, but is hosted and depends on rate limits.
