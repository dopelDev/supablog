# Supablog — Nuxt 3 + Bulma + Supabase

Stack listo con Vue 3, Vite, Nuxt, Bulma/SCSS y Supabase dockerizado para un blog multi-author con Storage y RLS.

## Resumen

Supablog es una base para desarrollar un blog con Auth (OAuth), posts con estados, comentarios moderados y archivos en Storage con acceso controlado. Las decisiones actuales viven en los planes v3.

## Documentacion y planes

- Base SQL y decisiones: `docs/plans/create_sql.md`
- Plan v3 DB/RLS/RPC: `docs/plans/DB_RLS_RPC_tringgers.v3.md`
- Plan v3 Storage: `docs/plans/buckets.v3.md`
- Plan v3 Seed data: `docs/plans/seed_data.v3.md`

## Decisiones v3 (resumen)

- Posts: status solo via RPC (publish/archive/unpublish).
- Comentarios: hidden por defecto; solo el autor del post puede mostrar/ocultar/borrar.
- Storage: bucket privado con policies publicas para posts publicados y avatars.
- Avatar/files: updates directos bloqueados; cambios via RPC.

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
