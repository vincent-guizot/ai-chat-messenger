# Deploy: Neon (database) + Render (backend) + Vercel (frontend)

Urutan: **Neon → backend-aichat → backend-core → frontend → kunci CORS**.

Status saat ini:
- backend-aichat sudah live: `https://chibi-ai-2mba.onrender.com`
- backend-core: belum (langkah 3)
- frontend: belum (langkah 4)

## 1. Neon

Di Neon Console → **Connect**, ambil dua connection string:

| Variabel | Ciri host | Dipakai untuk |
|---|---|---|
| `DATABASE_URL` | ada `-pooler` | aplikasi saat berjalan |
| `DATABASE_URL_UNPOOLED` | tanpa `-pooler` | `prisma migrate deploy` saat start |

Tabel dibuat otomatis saat backend-core pertama kali start (`npm start` → `prestart` → migrasi).
Tidak ada yang perlu dijalankan manual di Neon.

## 2. backend-aichat (sudah live)

Pastikan Environment di Render berisi:

```
NODE_ENV=production
DEFAULT_PROVIDER=openai
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=openai/gpt-oss-20b
OPENAI_API_KEY=<key Groq>
AI_SERVICE_TOKEN=<string acak, lihat catatan>
CORS_ORIGIN=*
```

Cek: `https://chibi-ai-2mba.onrender.com/api/health` → `"provider":"openai"`.

## 3. backend-core → Render (Web Service, runtime Node)

| Setting | Isi |
|---|---|
| Root Directory | `backend-core` |
| Build Command | `npm ci --include=dev` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

`--include=dev` wajib: Prisma CLI ada di devDependencies dan dipakai saat start untuk migrasi.

Environment:

```
NODE_VERSION=22
NODE_ENV=production
DATABASE_URL=<Neon pooled>
DATABASE_URL_UNPOOLED=<Neon direct>
JWT_SECRET=<minimal 16 karakter; buat dengan: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=https://chibi-ai-2mba.onrender.com
AI_SERVICE_TOKEN=<sama persis dengan di backend-aichat>
CORS_ORIGIN=*
```

`CORS_ORIGIN=*` hanya sementara sampai frontend jadi (langkah 5).

Cek: `https://<nama-core>.onrender.com/api/health`.

## 4. frontend → Vercel

| Setting | Isi |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment (Production dan Preview):

```
VITE_API_BASE=https://<nama-core>.onrender.com
```

Tanpa slash di akhir. Nilai ini tertanam saat build; kalau URL backend berubah, redeploy di Vercel.

## 5. Kunci CORS

Render → backend-core → Environment → `CORS_ORIGIN` = URL Vercel, tanpa slash di akhir.
Boleh lebih dari satu, dipisah koma (mis. domain produksi + preview):

```
CORS_ORIGIN=https://chibi-room.vercel.app,https://chibi-room-git-main-xxx.vercel.app
```

Simpan → Render redeploy otomatis. Lalu coba daftar/login dari URL Vercel.

## Catatan

- **`AI_SERVICE_TOKEN`** bukan diambil dari layanan mana pun. Ini kata sandi bersama yang Anda buat
  sendiri (string acak ≥ 32 karakter) dan diisi **sama persis** di backend-aichat dan backend-core.
  Tanpa ini, endpoint AI di Render bisa dipakai siapa saja dan menghabiskan kuota Groq Anda.
- **Token login lama** otomatis ditolak (401) jika user-nya tidak ada di database Neon; frontend akan
  mengarahkan ke halaman login. Daftar ulang, atau isi data demo: `cd backend-core && npm run db:seed`.
- Plan free Render tidur setelah ±15 menit idle; request pertama bisa 30–60 detik.
- Jika kredensial (password Neon, key Groq) pernah terbagi di chat/commit, ganti setelah deploy berhasil.
- `render.yaml` di root adalah alternatif (Blueprint) untuk membuat kedua backend sekaligus; tidak perlu
  dipakai kalau service sudah dibuat manual.

## Menjalankan lokal

```
# backend-aichat
cd backend-aichat && cp .env.example .env   # isi OPENAI_API_KEY
npm install && npm run dev                   # http://localhost:3001

# backend-core
cd backend-core && cp .env.example .env      # isi DATABASE_URL, JWT_SECRET
npm install && npm run dev                   # http://localhost:3000

# frontend
cd frontend && cp .env.example .env          # VITE_API_BASE kosong (proxy ke :3000)
npm install && npm run dev                   # http://localhost:5173
```

Tiap service dijalankan **dari foldernya sendiri**, karena `.env` dibaca dari folder tempat perintah dijalankan.
Setelah mengubah `.env`, hentikan (Ctrl+C) dan jalankan ulang; nodemon tidak memantau file `.env`.

Test: `cd backend-core && npm test` (butuh PostgreSQL lokal) dan `cd backend-aichat && npm test`.
