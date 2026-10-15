# AI Chat Messenger

Aplikasi chat real-time: ngobrol dengan AI Assistant dan chat langsung dengan user lain yang sedang online.

| Bagian   | Teknologi                                                                                   |
| -------- | ------------------------------------------------------------------------------------------- |
| Backend  | Node.js, Express, Socket.IO, Prisma, PostgreSQL, JWT                                        |
| Frontend | React 18, Vite, Tailwind CSS 4, React Query, Zustand, Motion, lucide-react, cva, React Hook Form + Zod, font Inter |
| AI       | Ollama (default) atau Hugging Face Inference API                                            |

## Fitur

- Login / daftar akun, "Remember me", lihat/sembunyikan password
- Chat dengan AI Assistant (balasan dirender sebagai markdown: daftar, blok kode + tombol Copy)
- **Direct message** ke user lain: buka tab **Contacts**, klik nama user
- Status **online / last seen** secara real-time
- Indikator **sedang mengetik** (user & AI)
- **Notifikasi** (tabel `Notification`): pesan DM baru + notifikasi sistem, lonceng dengan badge, tandai sudah dibaca
- Pencarian pesan, mode terang/gelap, sidebar bisa diciutkan, tampilan mobile
- Pintasan **Alt + N** untuk chat AI baru
- Tombol Google / GitHub / Microsoft, "Forgot password", lampiran & emoji: **tampilan saja**, fungsinya masih kosong (`TODO`)

## Struktur folder

```
ai-chat-messenger/
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # migrasi database (Prisma)
│   │   ├── prisma.js              # instance PrismaClient (dipakai services)
│   │   ├── schema.prisma          # definisi tabel
│   │   └── seed.js                # data demo
│   ├── scripts/
│   │   └── create-database.js     # membuat database PostgreSQL jika belum ada
│   ├── src/
│   │   ├── config/                # environment
│   │   ├── controllers/           # class + static method, menerima request & mengirim response
│   │   ├── middlewares/           # AuthMiddleware, ErrorMiddleware
│   │   ├── routes/                # hanya mendaftarkan URL -> controller
│   │   ├── services/              # logika bisnis & query database (Presence, Notification, dll.)
│   │   ├── sockets/               # event Socket.IO (ChatSocket)
│   │   ├── utils/                 # HttpError
│   │   ├── app.js                 # aplikasi Express
│   │   └── server.js              # entry point (HTTP + Socket.IO)
│   └── tests/                     # Jest + Supertest
└── frontend/
    └── src/
        ├── api/                   # pemanggilan REST API (class + static method)
        ├── components/
        │   ├── ui/                # komponen dasar: Button, IconButton, TextField, Avatar, DropdownMenu, Toast
        │   ├── sidebar/           # sidebar: navigasi, daftar chat AI, DM, kontak, footer user
        │   ├── notifications/     # lonceng & panel notifikasi
        │   └── chat/              # header, daftar pesan, gelembung pesan, blok kode, input
        ├── hooks/                 # React Query (useChatData, useNotifications), socket (useChatSocket), kirim pesan
        ├── lib/                   # socket, queryClient, chatCache, notificationCache, cn()
        ├── pages/                 # LoginPage, ChatPage
        ├── stores/                # Zustand: auth, ui (tema/sidebar), chat (status/typing)
        ├── styles/                # Tailwind v4 + token warna (navy, biru, aksen)
        └── utils/                 # format waktu, markdown, highlight kode
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
npm run dev                 # http://localhost:3000 (migrasi otomatis dijalankan dulu)
```

Akun demo setelah seed (password semua `password123`):

| Email            | Nama      |
| ---------------- | --------- |
| `admin@mail.com` | Admin 125 |
| `andi@mail.com`  | Andi      |
| `sarah@mail.com` | Sarah     |
| `budi@mail.com`  | Budi      |
| `david@mail.com` | David     |

Coba direct message: login sebagai `admin@mail.com` di satu browser, dan `andi@mail.com`
di browser lain (atau jendela incognito).

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Saat development, Vite mem-proxy `/api` dan `/socket.io` ke backend, jadi tidak perlu setting CORS.
Tailwind CSS v4 berjalan lewat plugin `@tailwindcss/vite` (tidak ada `tailwind.config` / `postcss.config`).

### 3. AI (opsional)

```bash
ollama pull llama3.1
ollama serve
```

Untuk Hugging Face: set `DEFAULT_PROVIDER=huggingface` dan `HUGGINGFACE_API_TOKEN` di `backend/.env`.

## Menjalankan dengan Docker

Kebutuhan: Docker dengan Docker Compose v2. Tidak perlu Node.js atau PostgreSQL di mesin host.

```bash
cp .env.example .env            # isi POSTGRES_PASSWORD dan JWT_SECRET (openssl rand -hex 32)
docker compose up -d --build
docker compose exec backend npm run db:seed   # opsional: data demo (akun demo di atas)
```

Buka http://localhost:8080 (ubah lewat `WEB_PORT`).

| Service    | Image / build        | Keterangan                                                                 |
| ---------- | -------------------- | -------------------------------------------------------------------------- |
| `db`       | `postgres:16-alpine` | Data disimpan di volume `db-data`; port tidak dibuka ke host               |
| `backend`  | `backend/Dockerfile` | Saat start: buat database + `prisma migrate deploy`, lalu jalankan server  |
| `frontend` | `frontend/Dockerfile`| Build Vite disajikan Nginx; `/api` dan `/socket.io` di-proxy ke backend    |

Hanya `frontend` yang dibuka ke host. Karena frontend dan API satu origin, CORS tidak diperlukan
dan `VITE_API_BASE` dibiarkan kosong.

Catatan:

- `POSTGRES_PASSWORD` dipakai di `DATABASE_URL`, jadi pakai karakter aman untuk URL (huruf, angka, `-`, `_`).
- AI lokal: default-nya memakai Ollama di mesin host (`OLLAMA_URL=http://host.docker.internal:11434`, jalankan Ollama dengan
  `OLLAMA_HOST=0.0.0.0`). Atau jalankan Ollama di dalam Docker: `docker compose --profile ollama up -d`,
  `docker compose exec ollama ollama pull llama3.1`, lalu set `OLLAMA_URL=http://ollama:11434`.
- Test backend di Docker: `docker compose --profile test run --rm backend-test`.
- Perintah berguna: `docker compose logs -f backend`, `docker compose down` (data tetap), `docker compose down -v` (hapus data).

## Test

```bash
cd backend
npm test
```

Test memakai database terpisah (`<nama_database>_test`) yang dibuat dan dimigrasi otomatis,
jadi data development tidak ikut terhapus.

## Script backend

| Script                      | Fungsi                                               |
| --------------------------- | ---------------------------------------------------- |
| `npm run dev`               | migrate lalu jalankan server dengan nodemon          |
| `npm start`                 | migrate lalu jalankan server (production)            |
| `npm run db:create`         | buat database jika belum ada                         |
| `npm run db:migrate`        | terapkan migrasi yang sudah ada                      |
| `npm run db:migrate:dev`    | buat migrasi baru setelah mengubah `schema.prisma`   |
| `npm run db:migrate:status` | cek status migrasi                                   |
| `npm run db:seed`           | isi data demo (aman dijalankan berulang kali)        |
| `npm run db:setup`          | create + migrate + seed sekaligus                    |
| `npm run db:reset`          | hapus semua data lalu migrate + seed ulang           |
| `npm test`                  | jalankan semua test                                  |

## API

| Method | URL                               | Auth | Keterangan                                    |
| ------ | --------------------------------- | ---- | --------------------------------------------- |
| GET    | `/api/health`                     | -    | cek server                                    |
| POST   | `/api/auth/signup`                | -    | `{ email, password, name? }`                  |
| POST   | `/api/auth/login`                 | -    | `{ email, password }`                         |
| GET    | `/api/users`                      | ya   | daftar kontak + `online` & `lastSeenAt`       |
| GET    | `/api/users/me`                   | ya   | data user yang sedang login                   |
| GET    | `/api/conversations`              | ya   | daftar percakapan user                        |
| POST   | `/api/conversations`              | ya   | `{ type?, title?, participantIds?, withAi? }` |
| POST   | `/api/conversations/direct`       | ya   | `{ userId }` buka/buat chat langsung          |
| GET    | `/api/conversations/:id/messages` | ya   | pesan dalam percakapan                        |
| GET    | `/api/notifications`              | ya   | 30 notifikasi terbaru + `unreadCount`         |
| PATCH  | `/api/notifications/:id/read`     | ya   | tandai satu notifikasi sudah dibaca           |
| PATCH  | `/api/notifications/read-all`     | ya   | `{ conversationId? }` tandai semua dibaca     |

Socket.IO (token dikirim lewat `auth: { token }`). Setiap user otomatis masuk room pribadi
`user:<id>`, jadi pesan DM tetap sampai walaupun percakapannya belum dibuka.

| Arah            | Event              | Data                                   |
| --------------- | ------------------ | -------------------------------------- |
| client → server | `message:create`   | `{ conversationId, content }`          |
| client → server | `typing`           | `{ conversationId, isTyping }`         |
| client → server | `join` / `leave`   | `{ conversationId }` (opsional)        |
| server → client | `message:new`      | pesan baru                             |
| server → client | `typing`           | `{ conversationId, userId, isTyping }` |
| server → client | `assistant:typing` | `{ conversationId, isTyping }`         |
| server → client | `presence:update`  | `{ userId, online, lastSeenAt }`       |
| server → client | `notification:new` | notifikasi baru (hanya ke penerimanya) |
| server → client | `error`            | `{ message }`                          |

## Tema warna

Didefinisikan di `frontend/src/styles/index.css` (blok `@theme`), dipakai sebagai class Tailwind:

| Token                    | Dipakai untuk                                  |
| ------------------------ | ---------------------------------------------- |
| `navy-600` … `navy-950`  | sidebar, halaman login, mode gelap             |
| `brand-50` … `brand-900` | warna utama biru: tombol, pesan sendiri, link  |
| `success` (hijau)        | online, berhasil disalin                       |
| `warning` (kuning)       | sedang menghubungkan ke server                 |
| `danger` (merah)         | error, koneksi terputus, badge belum dibaca    |
| `info` (biru muda)       | notifikasi sistem, toast informasi             |

## Tabel `Notification`

| Kolom            | Keterangan                                        |
| ---------------- | ------------------------------------------------- |
| `userId`         | penerima notifikasi                               |
| `type`           | `message` (pesan DM baru) atau `system`           |
| `title`, `body`  | judul & isi singkat                               |
| `actorId`        | user pemicu (mis. pengirim pesan), boleh kosong   |
| `conversationId` | percakapan terkait, boleh kosong                  |
| `data`           | JSON tambahan, mis. `{ messageId }`               |
| `readAt`         | kosong = belum dibaca                             |

Notifikasi dibuat otomatis saat ada pesan di direct message (untuk penerima) dan saat user baru mendaftar
(notifikasi sambutan). Membuka sebuah percakapan otomatis menandai notifikasinya sebagai sudah dibaca.
