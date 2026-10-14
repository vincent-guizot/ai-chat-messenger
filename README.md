# AI Chat Messenger

This repository contains a small AI chat messenger application with a Node.js backend and a React + Vite frontend. The backend uses Prisma + PostgreSQL and supports realtime messaging via Socket.IO. The frontend is built with React and Tailwind CSS.

This README explains how to set up the project locally, run migrations and seed data, run tests, and deploy.

---

## Quick overview

- Backend: Node.js, Express, Prisma, Socket.IO
- Database: PostgreSQL (managed by Prisma)
- Frontend: React, Vite, Tailwind CSS
- Tests: Jest + Supertest (backend)

---

## Demo credentials

- Email: `admin@mail.com`
- Password: `password123`
- Name: `Admin 125`

An AI assistant user is created automatically: `assistant@ai-chat.local` (password hidden, used only as a bot account).

---

## Prerequisites

- Node.js (>=18 recommended)
- npm
- PostgreSQL running locally or remotely

---

## Backend setup (Prisma)

1. Change directory to the backend:

   ```bash
   cd backend
   ```

2. Create a `.env` file based on `.env.example` and set `DATABASE_URL` to your Postgres connection string, for example:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chat
   JWT_SECRET=your_super_secret
   DEFAULT_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   PORT=3000
   ```

   For tests, you can set `DATABASE_URL_TEST` to a separate test database.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create the database (script will create the target database if it does not exist):

   ```bash
   npm run db:create
   ```

5. Generate Prisma client:

   ```bash
   npm run prisma:generate
   # or
   npx prisma generate
   ```

6. Run migrations (creates the schema):

   ```bash
   npm run prisma:migrate
   ```

7. Seed demo data (creates `admin@mail.com` and an AI conversation):

   ```bash
   npm run prisma:seed
   ```

8. Start the development server:

   ```bash
   npm run dev
   ```

   The server listens by default on `http://localhost:3000`.

---

## Frontend setup

1. Change directory to the frontend:

   ```bash
   cd frontend
   ```

2. Create a `.env` file or set `VITE_API_BASE` in your environment. Example `.env`:

   ```env
   VITE_API_BASE=http://localhost:3000
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open your browser at `http://localhost:5173`.

---

## Running tests (backend)

From the `backend` folder, run:

```bash
npm test
```

Tests run against the configured `DATABASE_URL` or `DATABASE_URL_TEST`. The test suite will reset the database schema for isolation, so do not point tests at a production database.

---

## Notes about seeders

This project previously contained Sequelize seeders. Those have been deprecated and replaced by `prisma/seed.js`. The old seeder files were removed/disabled. Use the Prisma seed script (`npm run prisma:seed`) going forward.

---

## AI providers

- Ollama (local) — recommended for offline/local usage. Example:

  ```bash
  ollama pull llama3.1
  ollama serve
  ```

- Hugging Face Inference API — set `HUGGINGFACE_API_TOKEN` in `.env` and set `DEFAULT_PROVIDER=huggingface` to use it.

The backend will select a provider via `DEFAULT_PROVIDER` environment variable.

---

## Deployment

- Frontend can be deployed to Vercel, Netlify, or any static host that supports Vite builds.
- Backend can be deployed to Render, Fly, Heroku, or any Node.js host. Make sure to set `DATABASE_URL` in production and run migrations prior to startup.

Suggested GitHub Actions or CI steps:

- Install Node.js
- Start a Postgres service
- npm install
- npm run prisma:generate
- npm run prisma:migrate -- --accept-data-loss (if needed in CI test flows)
- npm run prisma:seed
- npm test

---

## Contributing

- Keep server-side secrets out of source control. Use environment variables.
- Prefer readable code and avoid unnecessary shorthand.
- For schema changes, add a new Prisma migration and update seeds accordingly.

---

If you want, I can also:
- Add a GitHub Actions workflow for CI that runs migrations and tests automatically.
- Create a deploy guide for Render or Vercel with environment variable examples.

