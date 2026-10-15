# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Backend: Express + Socket.IO + Prisma (PostgreSQL)
# Target:
#   runtime (default) -> image production
#   test              -> image berisi devDependencies untuk menjalankan `npm test`
# ---------------------------------------------------------------------------
ARG NODE_VERSION=22
# Harus sama dengan versi "prisma" di package-lock.json
ARG PRISMA_VERSION=5.22.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
# Prisma membutuhkan OpenSSL; ca-certificates untuk koneksi HTTPS keluar (mis. Hugging Face).
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- dependency production + Prisma CLI -------------------------------------
FROM base AS prod-deps
ARG PRISMA_VERSION
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
# Prisma CLI adalah devDependency, tetapi dibutuhkan saat runtime
# (`prisma migrate deploy` dan `prisma db seed`), jadi dipasang terpisah.
RUN npm install --no-save --omit=dev --ignore-scripts prisma@${PRISMA_VERSION}
COPY prisma ./prisma
RUN npx prisma generate

# --- test (opsional): docker build --target test ----------------------------
FROM base AS test
ENV NODE_ENV=test
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
CMD ["npm", "test"]

# --- runtime ----------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# `npm start` menjalankan prestart (buat database + migrate deploy) lalu server.
CMD ["npm", "start"]
