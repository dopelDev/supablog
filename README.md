# Supablog — Nuxt 3 + Bulma + Supabase

Stack listo con Vue 3, Vite, Nuxt, Bulma/SCSS y Supabase dockerizado.

## Requisitos

- Node/NPM (se usa `npm`)
- Docker + Docker Compose

## Configuración rápida

1) Copia el entorno y ajusta claves si lo necesitas:

```bash
cp .env.example .env
```

2) Levanta Supabase local (API + Postgres + Auth + Realtime + Storage + Studio):

```bash
docker compose up -d
```

Servicios expuestos:

- API Gateway: http://localhost:54321 (rest/auth/realtime/storage)
- Studio: http://localhost:54323
- Postgres: localhost:5432

3) Instala dependencias y corre Nuxt:

```bash
npm install
npm run dev
```

Las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` se leen desde `.env` vía `runtimeConfig.public`.

## Scripts útiles

- `npm run dev` — modo desarrollo con Vite
- `npm run build` — build de producción
- `npm run preview` — previsualiza el build
