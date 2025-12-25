# Plan de accion v3 — DB + RLS + RPC + triggers (Supablog)

Este documento es autonomo y puede ser ejecutado por un agente distinto a los otros planes. Esta alineado con `docs/plans/create_sql.md` y transforma el SQL en un plan paso a paso con decisiones cerradas, ejecucion y verificacion.

## Objetivo

- Implementar el esquema minimo (profiles, posts, comments, files).
- Activar RLS + grants minimos.
- Implementar triggers y RPCs para acciones sensibles.
- Incluir moderacion de comentarios (hidden por defecto).
- Dejar un flujo verificable y repetible (migrations/seed/verify).

## Decisiones cerradas

1) Publicacion controlada:
- Solo via RPCs. Cambios directos de `status` bloqueados por trigger.

2) Archivar/despublicar:
- Se requieren `archive_post` y `unpublish_post`.

3) Comentarios:
- Por defecto `hidden`.
- Solo el autor del post puede mostrar/ocultar y borrar.
- Los comentaristas no pueden borrar ni editar su comentario.

4) Avatar y files:
- Updates directos bloqueados.
- Cambios solo via RPCs.

## Estructura de archivos (recomendada)

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
  verify/
    001_smoke.sql
```

## Paso a paso — Implementacion

### Paso 1 — Types

Archivo: `db/migrations/001_types.sql`

- Crear enum `public.post_status` con: `draft`, `published`, `archived`.

Checklist:
- [ ] `public.post_status` existe

### Paso 2 — Tablas

Archivo: `db/migrations/002_tables.sql`

- Crear `public.profiles`, `public.posts`, `public.comments`, `public.files`.
- Agregar moderacion de comentarios:
  - `comments.is_hidden boolean not null default true`
  - (Opcional recomendado) `comments.moderated_by uuid` y `comments.moderated_at timestamptz`

Checklist:
- [ ] Tablas creadas
- [ ] FKs correctas hacia `auth.users`
- [ ] `comments.is_hidden` con default `true`

### Paso 3 — Indices y constraints

Archivo: `db/migrations/003_indexes_constraints.sql`

- Indices de feed, dashboard, comments y files.
- Index recomendado para comentarios visibles por post:
  - `(post_id, created_at desc, id desc) where is_hidden = false`
- Constraint `unique (bucket, object_path)` en `public.files`.

Checklist:
- [ ] Indices creados
- [ ] Constraint de unicidad aplicado

### Paso 4 — Functions + triggers

Archivo: `db/migrations/004_functions_triggers.sql`

Implementar en este orden:

1) `handle_new_user()` + trigger `on_auth_user_created`.
2) `touch_updated_at()` + triggers en profiles/posts/comments.
3) `set_published_at()` + trigger en posts (si status = published).
4) `block_status_change()` + trigger para bloquear updates directos de `posts.status`.
5) `block_files_update()` + trigger para bloquear updates directos en `files` (solo via RPC).
6) `block_avatar_url_change()` + trigger para bloquear updates directos en `profiles.avatar_url`.
7) `block_comment_update()` + trigger para:
   - permitir solo cambios de `is_hidden` (y `moderated_*` si existe)
   - requerir flag `app.allow_comment_moderation = on`

Checklist:
- [ ] `profiles` se crea al registrarse
- [ ] `updated_at` se actualiza en updates
- [ ] Updates directos de `status` bloqueados
- [ ] Updates directos de files/avatar bloqueados
- [ ] Moderacion de comentarios solo via RPC

### Paso 5 — RPCs

Archivo: `db/migrations/005_rpc.sql`

Posts:
- `publish_post(p_post_id)`
- `archive_post(p_post_id)`
- `unpublish_post(p_post_id)`

Files:
- `attach_file_to_post(p_file_id, p_post_id)`
- `detach_file_from_post(p_file_id)`

Avatar:
- `set_profile_avatar_from_file(p_file_id)`
- `clear_profile_avatar()`

Comentarios:
- `set_comment_visibility(p_comment_id, p_is_hidden boolean)`
  - valida que el usuario actual es autor del post
  - setea `app.allow_comment_moderation = on`
  - actualiza `is_hidden` (y `moderated_*` si aplica)

Checklist:
- [ ] RPCs creadas y ejecutables
- [ ] Errores descriptivos en casos no permitidos

### Paso 6 — RLS + grants minimos

Archivo: `db/migrations/006_rls_grants.sql`

- Habilitar RLS en tables.
- `revoke all` a `anon`, `authenticated`.
- `grant` minimos por tabla + secuencias.
- Para `comments` permitir `select/insert/update/delete` a `authenticated` (control via policies).

Checklist:
- [ ] RLS habilitado
- [ ] Grants minimos aplicados

### Paso 7 — Views + policies

Archivo: `db/migrations/007_views_policies.sql`

- Crear `public.public_profiles` + `grant select`.

Policies clave:

- `profiles`: read/update own (avatar via RPC).
- `posts`: read published + read own; insert/update/delete own (status via RPC).
- `comments`:
  - select: visibles (`is_hidden = false`) para lectores permitidos
  - select: todos los comentarios del post si eres autor del post
  - insert: solo `authenticated` y solo en posts `published`
  - update: solo autor del post (actualiza `is_hidden` via RPC)
  - delete: solo autor del post
- `files`: read allowed + insert/update/delete own (updates bloqueados por trigger).

Checklist:
- [ ] `anon` ve posts publicados y comentarios visibles
- [ ] Autor del post puede ver/moderar todos los comentarios
- [ ] Ningun usuario puede editar/borrar comentarios ajenos
- [ ] `public_profiles` no expone email

### Paso 8 — Verificacion

Archivo: `db/verify/001_smoke.sql`

Incluye queries para validar:

- Publicacion via RPC y bloqueo de updates directos.
- Comentarios ocultos por defecto y visibles solo tras moderacion.
- Autor del post puede ocultar/mostrar/borrar.
- `anon` solo ve posts publicados y comentarios visibles.

Checklist:
- [ ] Queries devuelven resultados esperados

## Como ejecutar (manual o automatizado)

Ejecutar en orden con `psql` via Docker:

```bash
set -a; source .env; set +a

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f db/migrations/001_types.sql
```

Repetir para cada archivo en orden.

## Entregables (Definition of Done)

- [ ] Schema creado
- [ ] Triggers funcionando
- [ ] RPCs creadas
- [ ] RLS + policies funcionales
- [ ] Moderacion de comentarios operativa

## Resultado y aprendizajes (completar al finalizar)

- Resultado: <que se logro, con referencias a comprobaciones>
- Problemas encontrados: <errores, fallos de policy, dependencias>
- Soluciones aplicadas: <que se ajusto>
- Aprendizajes: <lecciones para futuras iteraciones>
- Pendientes: <que quedo fuera>
