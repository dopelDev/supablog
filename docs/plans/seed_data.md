# Plan de acción — Seed data (Supablog)

Este documento define cómo poblar datos de ejemplo (dev) para probar:

- Posts `draft` y `published`
- Comentarios
- Archivos (`public.files`) referenciando Storage (`storage.objects`)

## Objetivo

- Tener un set mínimo reproducible para desarrollo sin “romper” RLS.
- Separar claramente:
  - creación de usuarios (Auth)
  - datos de app (tablas `public.*`)
  - objetos en Storage (bucket)

## Enfoque de automatización (recomendado)

Para que sea repetible:

1) (Opcional, dev) Reset de DB → estado limpio.
2) Aplicar migrations (schema/RLS/policies).
3) Crear usuarios (Auth) de seed (idealmente automatizado).
4) Insertar datos de app (posts/comments/files) desde SQL de seed.
5) Subir archivos de seed a Storage (opcional) + registrar `public.files`.

Estructura sugerida (a crear):

```
db/
  seed/
    001_seed_app.sql
  seed-assets/
    demo-avatar.png
    demo-image.png
```

Comando típico (seed SQL) (ver también `docs/plans/DB_RLS_RPC_tringgers.md`):

```bash
set -a; source .env; set +a
docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f db/seed/001_seed_app.sql
```

## Pre-requisitos

- Implementación base ya aplicada:
  - `docs/plans/DB_RLS_RPC_tringgers.md` (schema + RLS + policies)
  - `docs/plans/buckets.md` (bucket + policies)
- Al menos 1–2 usuarios creados en Auth (para que existan `profiles`).

## Paso 1 — Crear usuarios (Auth)

Opción A (más simple, manual):

- Supabase Studio → Authentication → Users → “Add user”
- Crea:
  - `author1@example.com`
  - `author2@example.com`

Opción B (desde la app):

- Usa el flujo OAuth o `signUp` para crear usuarios.

Opción C (automatizable): crear usuarios vía Admin API (requiere service role key)

> Nota: esto hace requests HTTP a tu Supabase local (`SUPABASE_URL`). Úsalo solo en dev.

Ejemplo (ajusta password):

```bash
set -a; source .env; set +a

curl -sS -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"author1@example.com","password":"password","email_confirm":true}'

curl -sS -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"author2@example.com","password":"password","email_confirm":true}'
```

Checklist:

- [ ] Existen usuarios en `auth.users`
- [ ] Existe una fila por usuario en `public.profiles` (si usas trigger `handle_new_user()`)

## Paso 2 — Obtener los IDs (UUID) para usar en inserts

Automatización: evita “copiar UUID a mano”. En el seed SQL, resuelve IDs por email.

En Studio → SQL Editor (o `psql`), puedes verificar que existen:

```sql
select id, email
from auth.users
order by created_at desc;
```

Si el trigger `handle_new_user()` no corrió (o estás seed-eando sin Auth), puedes asegurar `profiles` con un upsert:

```sql
insert into public.profiles (id, email, display_name, avatar_url)
select u.id, u.email, split_part(u.email, '@', 1), ''
from auth.users u
where u.email in ('author1@example.com', 'author2@example.com')
on conflict (id) do nothing;
```

## Paso 3 — Insertar posts de ejemplo

Automatización: ejemplo de seed SQL “sin reemplazos” (IDs por email).

```sql
-- Limpieza (hace el seed re-ejecutable)
delete from public.comments where comment_text like 'Seed:%';
delete from public.files where file_name like 'seed-%';
delete from public.posts where title like 'Seed:%';

with
author1 as (select id from auth.users where email = 'author1@example.com' limit 1),
author2 as (select id from auth.users where email = 'author2@example.com' limit 1)
insert into public.posts (user_id, title, summary, content, status)
select author1.id, 'Seed: Draft Welcome', 'Borrador inicial para probar dashboard', 'Contenido de borrador...', 'draft'
from author1
union all
select author1.id, 'Seed: Published Hello Supablog', 'Primer post público de ejemplo', 'Contenido público con algo más de texto para probar render.', 'draft'
from author1
union all
select author2.id, 'Seed: Published Another Author', 'Post público de otro autor', 'Contenido público del segundo autor.', 'draft'
from author2;

-- Publicar vía UPDATE (útil si `published_at` se setea por trigger en UPDATE)
update public.posts set status = 'published'
where title in ('Seed: Published Hello Supablog', 'Seed: Published Another Author');

-- Alternativa (si NO tienes trigger): setear published_at manualmente
-- update public.posts set published_at = now()
-- where status = 'published' and published_at is null;
```

Checklist:

- [ ] Existe al menos 1 post `published`
- [ ] Existe al menos 1 post `draft`

## Paso 4 — Insertar comentarios de ejemplo

Asumiendo que los comentarios requieren `user_id` (dueño del comentario), crea comentarios sobre un post publicado:

```sql
with
author2 as (select id from auth.users where email = 'author2@example.com' limit 1),
target as (
  select id as post_id
  from public.posts
  where title = 'Seed: Published Hello Supablog' and status = 'published'
  limit 1
)
insert into public.comments (post_id, user_id, comment_text)
select target.post_id, author2.id, 'Seed: Buen post. Comentario de prueba.'
from target, author2;
```

Checklist:

- [ ] Al menos 1 comentario existe y se lee en el post publicado

## Paso 5 — Seed de Storage + `public.files`

Hay dos partes:

1) Subir archivos al bucket `blog-files`
2) Registrar metadata en `public.files`

### 5.1 Subir archivos (manual o automatizable)

En Studio → Storage → `blog-files`:

- Sube un archivo usando un path con tu uid al inicio, por ejemplo:
  - `{AUTHOR1_ID}/avatar/seed-avatar.png`
  - `{AUTHOR1_ID}/posts/{POST_ID}/seed-image.png`

Nota: si el uploader es el usuario autenticado, usa su propio UID real (no el de otro).

Automatización (opcional): subir por HTTP usando service role key (dev).

> No lo ejecutes si no tienes claro el impacto. Asegúrate de que el bucket y policies existen.

```bash
# Ejemplo conceptual (ajusta paths/archivos)
set -a; source .env; set +a

# requiere que AUTHOR1_ID sea el UUID real; lo obtenemos desde DB por email
AUTHOR1_ID="$(
  docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select id from auth.users where email='author1@example.com' limit 1;"
)"
AUTHOR1_ID="$(echo "$AUTHOR1_ID" | tr -d '[:space:]')"

# Nota: según tu versión de Storage API, puede ser POST o PUT.
curl -sS -X POST "$SUPABASE_URL/storage/v1/object/blog-files/$AUTHOR1_ID/avatar/seed-avatar.png" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: image/png" \
  --data-binary "@db/seed-assets/demo-avatar.png"
```

### 5.2 Registrar metadata en `public.files`

Automatización: identificar `POST_ID` sin copiar/pegar:

```sql
select id, title, status
from public.posts
where title = 'Seed: Published Hello Supablog';
```

Luego inserta una fila en `public.files` con el `object_path` exacto:

```sql
with author1 as (select id from auth.users where email = 'author1@example.com' limit 1)
insert into public.files (user_id, post_id, bucket, object_path, file_name, mime_type, size_bytes)
select
  author1.id,
  null,
  'blog-files',
  author1.id::text || '/avatar/seed-avatar.png',
  'seed-avatar.png',
  'image/png',
  null
from author1;

with
author1 as (select id from auth.users where email = 'author1@example.com' limit 1),
post as (select id from public.posts where title = 'Seed: Published Hello Supablog' limit 1)
insert into public.files (user_id, post_id, bucket, object_path, file_name, mime_type, size_bytes)
select
  author1.id,
  post.id,
  'blog-files',
  author1.id::text || '/posts/' || post.id::text || '/seed-image.png',
  'seed-image.png',
  'image/png',
  null
from author1, post;
```

Checklist:

- [ ] `public.files.object_path` coincide con el nombre real del objeto en Storage
- [ ] Archivos del post publicado se pueden leer según tu decisión (policy pública o signed URL)

## Paso 6 — Verificación desde el cliente (RLS real)

Verifica con la app (logueado como cada usuario):

- Author1:
  - ve su draft y puede editarlo
  - ve sus files (library)
- Author2:
  - no puede editar/borrar posts de Author1
  - puede comentar en post publicado (si está permitido)
- Visitante (anon):
  - ve posts publicados
  - no ve drafts
  - acceso a imágenes según tu decisión en `docs/plans/buckets.md`

## Reset (opcional)

Para resetear seed data en dev, define qué se considera seguro borrar:

- `public.comments` (ok borrar)
- `public.files` (ok borrar si también limpias Storage)
- `public.posts` (ok borrar)
- usuarios Auth: borrar solo si lo haces consciente (puede romper FKs si no cascadea)

No ejecutes borrados masivos sin confirmar qué quieres preservar.
