# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Backend aichat: Express kecil yang memanggil provider AI (Ollama / OpenAI-compatible / Hugging Face).
# Tidak memakai database.
# Target:
#   runtime (default) -> image production
#   test              -> image berisi devDependencies untuk menjalankan `npm test`
# ---------------------------------------------------------------------------
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
# ca-certificates untuk koneksi HTTPS keluar ke provider AI (Groq, Hugging Face, dll.).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- dependency production ---------------------------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- test (opsional): docker build --target test ----------------------------
FROM base AS test
ENV NODE_ENV=test
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "test"]

# --- runtime ----------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
