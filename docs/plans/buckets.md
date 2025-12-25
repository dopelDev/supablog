# Plan de acción — Storage buckets + policies (Supablog)

Este documento acompaña `docs/plans/create_sql.md` y se enfoca solo en Storage: buckets, convenciones de path y policies en `storage.objects`.

## Enfoque de automatización (recomendado)

- Guardar las policies de Storage en un archivo SQL versionado (ej: `db/migrations/008_storage_policies.sql`).
- Tratar la creación del bucket como:
  - **one-time manual** (rápido), o
  - **automatizable** (si quieres que el entorno se levante “desde cero” sin clicks).

Comando típico para aplicar un SQL (ver también `docs/plans/DB_RLS_RPC_tringgers.md`):

```bash
set -a; source .env; set +a
docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f db/migrations/008_storage_policies.sql
```

## Objetivo

- Bucket privado para archivos del blog.
- Convención de rutas que permita validar ownership por prefijo `{uid}/...`.
- Policies de lectura:
  - dueño siempre puede leer
  - público puede leer solo archivos ligados a posts publicados (opcional)
  - público puede leer avatars (opcional)

## Decisiones (elige antes de implementar)

1) Acceso a archivos en posts publicados:
- Opción A (más simple): policy pública para lectura de archivos de posts publicados.
- Opción B (más control): bucket siempre privado + generar **signed URLs** en runtime (cliente o backend).

2) Avatars:
- Opción A: avatar se lee públicamente por policy (si es parte del profile público).
- Opción B: avatar por signed URL.

Este plan asume Opción A para posts publicados y avatars (porque está alineado con la guía actual).

## Paso 1 — Crear bucket

En Supabase Studio → Storage:

- Create bucket: `blog-files`
- Public: **NO** (privado)

Opcional (si quieres 100% automatizado): crear el bucket por SQL o API.

- SQL (depende del schema de `storage.buckets`; verifica columnas antes):

```sql
-- ejemplo típico en Supabase (ajusta si tu schema difiere)
insert into storage.buckets (id, name, public)
values ('blog-files', 'blog-files', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;
```

Checklist:

- [ ] Bucket `blog-files` existe
- [ ] Está configurado como privado

## Paso 2 — Convención de rutas (object name)

Guardar objetos con nombre (path) que empiece con el UID:

- `blog-files/{uid}/posts/{postId}/{uuid}-{filename}`
- `blog-files/{uid}/avatar/{uuid}-{filename}`
- `blog-files/{uid}/misc/{uuid}-{filename}` (si no está ligado a post)

Regla clave: `split_part(name, '/', 1) = auth.uid()::text`.

Checklist:

- [ ] El cliente que sube archivos siempre usa `{uid}/...`
- [ ] En DB, `public.files.object_path` coincide con `storage.objects.name`

## Paso 3 — Policies en `storage.objects`

En Studio → SQL Editor, crear policies (ver sección 8 en `docs/plans/create_sql.md`).

Automatización: poner estas policies en `db/migrations/008_storage_policies.sql` (y ejecutarlas con `psql`).

### 3.1 Upload solo a tu carpeta

- Insert: permitido solo si `bucket_id='blog-files'` y el primer folder es tu uid.

### 3.2 Leer propios (authenticated)

- Select: permitido solo si `bucket_id='blog-files'` y el primer folder es tu uid.

### 3.3 Leer archivos ligados a posts publicados (anon + authenticated) (opcional)

- Select: permitido si existe una fila en `public.files` que apunte a ese `storage.objects.name` y su `post` está `published`.

### 3.4 Leer avatars públicos (anon + authenticated) (opcional)

- Select: permitido si `public.public_profiles.avatar_url` coincide con `storage.objects.name`.

Checklist:

- [ ] Un usuario autenticado puede subir a su carpeta
- [ ] Un usuario autenticado no puede leer objetos de otro uid
- [ ] `anon` solo puede leer archivos de posts publicados (si activaste 3.3)
- [ ] `anon` solo puede leer avatars que estén en `public.public_profiles` (si activaste 3.4)

## Paso 4 — Integración con tabla `public.files`

Recomendación mínima:

- Después de subir a Storage, insertar una fila en `public.files` con:
  - `bucket='blog-files'`
  - `object_path` = el nombre exacto en Storage
  - `user_id=auth.uid()`
  - `post_id` si aplica

Si quieres tratar “adjuntar a post” como acción:

- Sube el archivo → inserta en `public.files` con `post_id = null`
- Luego llama RPC `attach_file_to_post(...)` (ver `docs/plans/DB_RLS_RPC_tringgers.md`)

Automatización (seed): la carga de archivos y el insert en `public.files` normalmente se hacen juntos; ver `docs/plans/seed_data.md`.

## Alternativa recomendada (si quieres más control): signed URLs

- Mantén el bucket privado, sin policies públicas de lectura.
- Para mostrar imágenes/adjuntos en posts publicados:
  - Genera signed URLs desde el cliente con Supabase (si aceptas que el cliente lo haga), o
  - Genera signed URLs desde backend/Edge Function (más control).

Checklist:

- [ ] UI usa URL firmada con expiración
- [ ] No dependes de policies públicas para lectura
