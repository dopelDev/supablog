# Plan de acción v2 — DB + RLS + RPC + triggers (Supablog)

Este documento es autónomo y puede ser ejecutado por un agente distinto a los otros planes. Está alineado con `docs/plans/create_sql.md` y transforma el SQL en un plan paso a paso con decisiones explícitas, ejecución y verificación.

## Objetivo

- Implementar el esquema mínimo (profiles, posts, comments, files).
- Activar RLS + grants mínimos.
- Implementar triggers y RPCs para acciones sensibles.
- Dejar un flujo verificable y repetible (migrations/seed/verify).

## Supuestos explícitos (si alguno cambia, detente y actualiza)

- Multi-author (cada usuario autenticado puede crear posts).
- Posts públicos solo cuando `status = 'published'`.
- Comentarios requieren login y se leen solo si el post es legible.
- Storage y policies se manejan en un plan separado (`buckets.v2.md`).

## Decisiones pendientes (deben resolverse antes de ejecutar)

1) Publicación controlada:
- Opción A: cambios de `status` permitidos por update directo (más simple).
- Opción B: bloquear cambios de `status` y exigir RPCs (más control).

2) Archivar/despublicar:
- ¿Se requiere `archive_post` y/o `unpublish_post`?

3) Comentarios:
- ¿Se permite borrar comentarios? (policy de delete propio ya está prevista).

4) Actualización de avatar y files:
- Opción A: updates directos permitidos (simple).
- Opción B: bloquear updates y usar RPCs (modo pro).

> Si no hay decisión, asumir Opción A (simple) y documentar la elección.

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

## Paso a paso — Implementación

### Paso 1 — Types

Archivo: `db/migrations/001_types.sql`

- Crear enum `public.post_status`.

Checklist:
- [ ] `public.post_status` existe

### Paso 2 — Tablas

Archivo: `db/migrations/002_tables.sql`

- Crear `public.profiles`, `public.posts`, `public.comments`, `public.files`.
- FKs correctas hacia `auth.users` y relaciones entre tablas.

Checklist:
- [ ] Tablas creadas
- [ ] FKs correctas
- [ ] Defaults de `created_at` y `updated_at`

### Paso 3 — Índices y constraints

Archivo: `db/migrations/003_indexes_constraints.sql`

- Índices de feed, dashboard, comments y files.
- Constraint `unique (bucket, object_path)` en `public.files`.

Checklist:
- [ ] Índices creados
- [ ] Constraint de unicidad aplicado

### Paso 4 — Functions + triggers

Archivo: `db/migrations/004_functions_triggers.sql`

Implementar en este orden:

1) `handle_new_user()` + trigger `on_auth_user_created`.
2) `touch_updated_at()` + triggers en profiles/posts/comments.
3) (Opcional) `set_owner_id()` si no usas `default auth.uid()`.
4) (Opcional) `set_published_at()` + trigger.
5) (Opcional, modo pro) `block_status_change()`.
6) (Opcional, modo pro) `block_files_update()`.
7) (Opcional, modo pro) `block_avatar_url_change()`.

Checklist:
- [ ] `profiles` se crea al registrarse
- [ ] `updated_at` se actualiza en updates
- [ ] (Si aplica) cambios directos de `status` bloqueados
- [ ] (Si aplica) cambios de files/avatar bloqueados

### Paso 5 — RPCs

Archivo: `db/migrations/005_rpc.sql`

Implementar según decisiones:

- `post_is_publishable()` (opcional pero recomendado).
- `publish_post()` y `archive_post()`.
- `unpublish_post()` (si se permite volver a draft).
- RPCs de files/avatars si se bloquean updates directos:
  - `attach_file_to_post()`
  - `detach_file_from_post()`
  - `set_profile_avatar_from_file()`
  - `clear_profile_avatar()`

Checklist:
- [ ] RPCs creadas y ejecutables
- [ ] Errores descriptivos en casos no permitidos

### Paso 6 — RLS + grants mínimos

Archivo: `db/migrations/006_rls_grants.sql`

- Habilitar RLS en tables.
- `revoke all` a `anon`, `authenticated`.
- `grant` mínimos por tabla + secuencias.

Checklist:
- [ ] RLS habilitado
- [ ] Grants mínimos aplicados

### Paso 7 — Views + policies

Archivo: `db/migrations/007_views_policies.sql`

- Crear `public.public_profiles` + `grant select`.
- Policies:
  - `profiles`: read/update own
  - `posts`: read published + read own + insert/update/delete own
  - `comments`: read/insert on allowed posts + delete own
  - `files`: read allowed + insert/update/delete own

Checklist:
- [ ] `anon` puede leer posts publicados
- [ ] `authenticated` puede leer drafts propios
- [ ] `public_profiles` no expone email

### Paso 8 — Verificación

Archivo: `db/verify/001_smoke.sql`

Incluye queries mínimas para validar:

- Posts publicados
- Drafts propios
- Join `files` con posts
- `public_profiles` retorna solo campos públicos

Checklist:
- [ ] Queries devuelven resultados esperados

## Cómo ejecutar (manual o automatizado)

Ejecutar en orden (por ejemplo con `psql` vía Docker):

```bash
set -a; source .env; set +a

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f db/migrations/001_types.sql
```

Repetir para cada archivo en orden.

## Entregables (Definition of Done)

- [ ] Schema creado
- [ ] Triggers funcionando
- [ ] RPCs creadas (si aplican)
- [ ] RLS + policies funcionales
- [ ] Smoke checks pasan

## Resultado y aprendizajes (completar al finalizar)

- Resultado: <qué se logró, con referencias a comprobaciones>
- Problemas encontrados: <errores, fallos de policy, dependencias>
- Soluciones aplicadas: <qué se ajustó>
- Aprendizajes: <lecciones para futuras iteraciones>
- Pendientes: <qué quedó fuera>
