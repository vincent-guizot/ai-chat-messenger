# Deploy: Neon + Render + Vercel

Urutan: **Neon → Render (aichat, lalu core) → Vercel → update CORS di Render**.

## 1. Neon (database)
Di Neon Console → *Connect*, salin dua connection string:
- **Pooled** (host ada `-pooler`) → untuk `DATABASE_URL`
- **Direct** (tanpa `-pooler`) → untuk `DATABASE_URL_UNPOOLED` (khusus migrasi)

Tabel dibuat otomatis saat backend-core start (`prisma migrate deploy`). Tidak perlu aksi manual.

## 2. Render (backend)
1. Push repo ini ke GitHub.
2. Render → **New → Blueprint** → pilih repo → Render membaca `render.yaml` (2 service: `chibi-aichat`, `chibi-core`).
3. Isi variabel yang diminta:
   - `chibi-aichat`: `OPENAI_API_KEY` (key Groq/OpenRouter)
   - `chibi-core`: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AI_SERVICE_URL` (= URL publik chibi-aichat, mis. `https://chibi-aichat.onrender.com`), `CORS_ORIGIN` (isi sementara `*`, ganti setelah Vercel jadi)
4. Cek `https://<chibi-core>.onrender.com/api/health`.

## 3. Vercel (frontend)
1. Vercel → **Add New Project** → pilih repo → **Root Directory: `frontend`**.
2. Environment Variable: `VITE_API_BASE` = `https://<chibi-core>.onrender.com` (tanpa slash di akhir).
3. Deploy.

## 4. Kunci CORS
Di Render → `chibi-core` → Environment → `CORS_ORIGIN` = URL Vercel (mis. `https://chibi-room.vercel.app`, tanpa slash) → simpan (auto redeploy).

## Catatan
- Plan free Render tidur setelah ~15 menit idle; request pertama bisa 30–60 detik.
- Ganti `JWT_SECRET`/password Neon jika pernah dibagikan di chat atau commit.
