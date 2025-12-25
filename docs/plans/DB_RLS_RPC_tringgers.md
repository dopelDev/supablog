# Plan de acción — DB + RLS + RPC + triggers (Supablog)

Este documento transforma `docs/plans/create_sql.md` en un plan de implementación por fases, con checklist y verificación.

## Enfoque de automatización (recomendado)

La forma más rápida de iterar (sin copiar/pegar en Studio cada vez) es:

1) Guardar el SQL en archivos versionados (migrations/seed).
2) Tener un comando repetible para:
   - resetear DB (opcional, dev)
   - aplicar migrations en orden
   - correr seed

### Estructura sugerida (a crear)

> No existe todavía en el repo; es la convención recomendada para automatizar.

```
db/
  migrations/
    001_types.sql
    002_tables.sql
    003_indexes_constraints.sql
    004_functions_triggers.sql
    005_rpc.sql
    006_rls_grants.sql
    007_views_policies.sql
    008_storage_policies.sql
  seed/
    001_seed_app.sql
  verify/
    001_smoke.sql
```

### Comandos base (sin scripts)

Cargar variables de entorno (para usar `$POSTGRES_*` / `$SUPABASE_*` en el shell):

```bash
set -a
source .env
set +a
```

Aplicar un archivo SQL usando el contenedor `db` (recomendado si no tienes `psql` local):

```bash
docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f db/migrations/001_types.sql
```

Alternativa (si tienes `psql` local):

```bash
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -v ON_ERROR_STOP=1 -f db/migrations/001_types.sql
```

Reset destructivo (solo dev, borra volumen `db-data`):

```bash
docker compose down -v
docker compose up -d
```

## Objetivo

- Tener un esquema mínimo: `profiles`, `posts`, `comments`, `files`.
- Aplicar **RLS** + permisos mínimos para evitar lecturas/escrituras accidentales.
- Usar **RPCs** para acciones sensibles (publish/archive/attach avatar, etc.).
- Automatizar campos con **triggers** (`updated_at`, `published_at`, creación de `profiles`).

## Pre-requisitos

- Supabase local levantado (`docker compose up -d`).
- Acceso a Studio (`http://localhost:54323`) → SQL Editor (fallback manual).
- Decisiones confirmadas:
  - Single-author vs multi-author (este plan asume multi-author).
  - Comentarios: sí/no, y si requieren moderación.
  - Archivos: exposición por policy vs signed URLs (ver `docs/plans/buckets.md`).

## Orden recomendado de implementación (fases)

### Fase 1 — Esquema base (types + tablas)

Automatizable como `db/migrations/001_types.sql` + `db/migrations/002_tables.sql`.

En Studio (manual) o vía `psql`, ejecutar en este orden:

- Enum `public.post_status` (ver sección 4.1 en `docs/plans/create_sql.md`).
- Tablas:
  - `public.profiles` (4.2)
  - `public.posts` (4.3)
  - `public.comments` (4.4)
  - `public.files` (4.5)

Checklist:

- [ ] `public.post_status` existe
- [ ] Todas las FKs apuntan a lo esperado (`profiles.id` → `auth.users.id`)
- [ ] `posts.summary` existe y tiene default
- [ ] `files.bucket` y `files.object_path` existen

### Fase 2 — Índices y constraints

Automatizable como `db/migrations/003_indexes_constraints.sql`.

Ejecutar (manual o automatizado):

- Índices sugeridos (4.6 en `docs/plans/create_sql.md`)
- Constraint de unicidad para `files`:
  - recomendado: `unique (bucket, object_path)` (ya está en `docs/plans/create_sql.md`)

Checklist:

- [ ] `idx_posts_published_feed` existe
- [ ] `files_object_path_unique` existe

### Fase 3 — Functions + triggers (automatización)

Automatizable como `db/migrations/004_functions_triggers.sql`.

Ejecutar en orden (manual o automatizado):

1) Crear profile al registrar:

- Function `public.handle_new_user()` + trigger `on_auth_user_created` (sección 5)

2) `updated_at` automático:

- Function `public.touch_updated_at()` + triggers para `profiles/posts/comments` (sección 6)

3) Dueño de post (opcional):

- Trigger `set_owner_id()` (sección “Opcional: asegurar user_id en inserts de posts”)
- Alternativa recomendada: usar `default auth.uid()` en columna `posts.user_id` y eliminar trigger.

4) `published_at` automático (opcional pero recomendado):

- Function `public.set_published_at()` + trigger `trg_posts_published_at` (sección 6)

5) Bloquear cambios “directos” de status (opcional “modo pro”):

- `public.block_status_change()` + `trg_block_status_change`
- Depende de usar RPCs que setean `app.allow_status_change=on` (sección 6)

Checklist:

- [ ] Registrar usuario crea `public.profiles` automáticamente
- [ ] Updates en `profiles/posts/comments` tocan `updated_at`
- [ ] (Si aplica) Cambiar `posts.status` directo falla sin RPC

### Fase 4 — RPCs (acciones)

Automatizable como `db/migrations/005_rpc.sql`.

Implementar si vas a tratar “publicar/archivar” como acciones controladas:

- Helpers:
  - `public.post_is_publishable(p_id)` (opcional)
- RPCs:
  - `public.publish_post(p_post_id)`
  - `public.archive_post(p_post_id)`
  - `public.unpublish_post(p_post_id)` (opcional)

Para files/avatars (opcional “modo pro”):

- Trigger `block_files_update()` (solo permite cambiar `post_id` con flag)
- RPCs:
  - `attach_file_to_post(p_file_id, p_post_id)`
  - `detach_file_from_post(p_file_id)`
  - `set_profile_avatar_from_file(p_file_id)`
  - `clear_profile_avatar()`

Checklist:

- [ ] Publicar post funciona solo si es tuyo y cumple validaciones
- [ ] Adjuntar/desadjuntar files respeta ownership del post
- [ ] Avatar solo acepta `image/*` y solo files propios sin `post_id`

### Fase 5 — RLS + grants mínimos

Automatizable como `db/migrations/006_rls_grants.sql`.

Ejecutar en orden (sección 7):

1) `alter table ... enable row level security`
2) `revoke all` a `anon, authenticated`
3) `grant` mínimos (select/insert/update/delete/sequence según tabla)

Checklist:

- [ ] RLS habilitado en `profiles/posts/comments/files`
- [ ] Sin policies, el acceso queda bloqueado (esperado)

### Fase 6 — View pública + policies

Automatizable como `db/migrations/007_views_policies.sql`.

1) Crear `public.public_profiles` (sección 7.2) y grant select.
2) Policies:

- `profiles`: leer/update solo dueño
- `posts`: leer `published` (público) + leer propios (privado)
- `comments`: leer/insert con `can_read_post()`, delete propio
- `files`: leer allowed, insert/update/delete own (y validación de prefijo de ruta)

Checklist funcional (mínimo):

- [ ] `anon` puede leer posts `published`
- [ ] `authenticated` puede ver sus drafts
- [ ] Un usuario no puede editar/borrar posts ajenos
- [ ] Un usuario no puede leer `profiles.email` públicamente (solo via view)

### Fase 7 — Storage (bucket + policies)

Automatizable como `db/migrations/008_storage_policies.sql` + comandos de Storage descritos en `docs/plans/buckets.md`.

Implementar siguiendo `docs/plans/buckets.md`.

## Verificación (rápida, manual)

Automatizable como `db/verify/001_smoke.sql` (smoke checks básicos).

En Studio → SQL Editor (manual) o vía `psql`:

- Ver tablas/funciones/triggers creados:
  - `\dt public.*` (si usas `psql`)
  - o desde UI de “Table Editor”

Queries útiles (sección 10 en `docs/plans/create_sql.md`):

- Feed público: posts publicados ordenados
- Drafts propios: `where user_id = auth.uid()`
- Files por post: `where post_id = ...`

## Entregables (Definition of Done)

- [ ] Schema creado (types/tables/indexes/constraints)
- [ ] Triggers funcionando (profiles/updated_at/published_at según decisión)
- [ ] RPCs creadas (si aplica)
- [ ] RLS + policies funcionando para los flujos reales
- [ ] Storage bucket + policies funcionando (subida y lectura controlada)

## Follow-ups recomendados (no bloqueantes)

- Soft deletes (`deleted_at`) si quieres historial
- `slug` único para URLs amigables
- Moderación de comentarios (flag/status + policies)
