# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Frontend: React + Vite, dibuild lalu disajikan oleh Nginx.
# Nginx juga mem-proxy /api dan /socket.io ke backend (satu origin, tanpa CORS).
# ---------------------------------------------------------------------------
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Kosongkan agar frontend memakai path relatif (/api, /socket.io) -> lewat proxy Nginx.
# Isi hanya jika backend di-deploy di domain terpisah (mis. https://api.domain.com).
ARG VITE_API_BASE=
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Nama host/port backend dibaca saat container start (envsubst bawaan image nginx).
ENV BACKEND_HOST=backend \
    BACKEND_PORT=3000 \
    NGINX_ENVSUBST_FILTER=BACKEND_
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
    CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
