# AI Chat Messenger

Aplikasi chat real-time dengan AI Assistant.

| Bagian   | Teknologi                                                      |
| -------- | -------------------------------------------------------------- |
| Backend  | Node.js, Express, Socket.IO, Prisma, PostgreSQL, JWT           |
| Frontend | React 18, Vite, Tailwind CSS 3, Zustand, React Hook Form + Zod |
| AI       | Ollama (default) atau Hugging Face Inference API               |

## Struktur folder

```
ai-chat-messenger/
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # migrasi database (Prisma)
│   │   ├── schema.prisma          # definisi tabel
│   │   └── seed.js                # data demo
│   ├── scripts/
│   │   └── create-database.js     # membuat database PostgreSQL jika belum ada
│   ├── src/
│   │   ├── config/                # environment & koneksi database
│   │   ├── controllers/           # class + static method, menerima request & mengirim response
│   │   ├── middlewares/           # AuthMiddleware, ErrorMiddleware
│   │   ├── routes/                # hanya mendaftarkan URL -> controller
│   │   ├── services/              # logika bisnis & query database
│   │   ├── sockets/               # event Socket.IO
│   │   ├── utils/                 # HttpError
│   │   ├── app.js                 # aplikasi Express
│   │   └── server.js              # entry point (HTTP + Socket.IO)
│   └── tests/                     # Jest + Supertest
└── frontend/
    └── src/
        ├── api/                   # pemanggilan REST API
        ├── components/
        │   ├── chat/              # komponen khusus halaman chat
        │   └── common/            # komponen umum (Avatar, SearchBar, Toast)
        ├── hooks/                 # useChat (state + socket)
        ├── lib/                   # instance Socket.IO
        ├── pages/                 # LoginPage, ChatPage
        ├── stores/                # Zustand (auth)
        ├── styles/                # CSS global + Tailwind
        └── utils/                 # helper format
```

Alur request backend: `routes` → `controllers` → `services` → `prisma`.

## Menjalankan

Kebutuhan: Node.js 18+ dan PostgreSQL. Ollama opsional (tanpa Ollama, AI akan membalas pesan error).

### 1. Backend

```bash
cd backend
cp .env.example .env        # sesuaikan DATABASE_URL & JWT_SECRET
npm install                 # otomatis menjalankan "prisma generate"
npm run db:setup            # create database + migrate + seed
npm run dev                 # http://localhost:3000
```

Akun demo setelah seed: `admin@mail.com` / `password123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Saat development, Vite mem-proxy `/api` dan `/socket.io` ke backend, jadi tidak perlu setting CORS.

### 3. AI (opsional)

```bash
ollama pull llama3.1
ollama serve
```

Untuk Hugging Face: set `DEFAULT_PROVIDER=huggingface` dan `HUGGINGFACE_API_TOKEN` di `backend/.env`.

## Test

```bash
cd backend
npm test
```

Test memakai database terpisah (`<nama_database>_test`) yang dibuat dan dimigrasi otomatis,
jadi data development tidak ikut terhapus.

## Script backend

| Script                   | Fungsi                                               |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | jalankan server dengan nodemon                       |
| `npm start`              | jalankan server (production)                         |
| `npm run db:create`      | buat database jika belum ada                         |
| `npm run db:migrate`     | terapkan migrasi yang sudah ada                      |
| `npm run db:migrate:dev` | buat migrasi baru setelah mengubah `schema.prisma`   |
| `npm run db:seed`        | isi data demo (aman dijalankan berulang kali)        |
| `npm run db:setup`       | create + migrate + seed sekaligus                    |
| `npm test`               | jalankan semua test                                  |

## API

| Method | URL                               | Auth | Keterangan                                   |
| ------ | --------------------------------- | ---- | -------------------------------------------- |
| GET    | `/api/health`                     | -    | cek server                                   |
| POST   | `/api/auth/signup`                | -    | `{ email, password, name? }`                 |
| POST   | `/api/auth/login`                 | -    | `{ email, password }`                        |
| GET    | `/api/conversations`              | ya   | daftar percakapan user                       |
| POST   | `/api/conversations`              | ya   | `{ type?, title?, participantIds?, withAi? }` |
| GET    | `/api/conversations/:id/messages` | ya   | pesan dalam percakapan                       |

Socket.IO (token dikirim lewat `auth: { token }`):

- client → server: `join`, `leave`, `message:create` `{ conversationId, content }`
- server → client: `message:new`, `error`
