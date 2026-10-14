/**
 * README additions for Postgres + Prisma
 */

# Postgres + Prisma setup

1. Install Postgres locally or via Docker and create database `ai_chat`.
2. Copy `.env.example` to `.env` and set DATABASE_URL and JWT_SECRET.
3. Generate Prisma client & run migration:

   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init

4. Start backend:
   npm run dev

Notes:
- This project uses Prisma with Postgres for production-ready data storage.
- For development you can run Postgres in Docker:

  docker run --name ai_chat_postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_chat -p 5432:5432 -d postgres:15

