# Plan de accion v3 — Storage buckets + policies (Supablog)

Este documento es autonomo y puede ser ejecutado por un agente distinto a los otros planes. Esta alineado con `docs/plans/create_sql.md` y define un plan paso a paso para Storage con decisiones cerradas.

## Objetivo

- Crear bucket privado `blog-files`.
- Definir convencion de rutas por usuario (`{uid}/...`).
- Configurar policies de `storage.objects` para lectura publica controlada.

## Decisiones cerradas

1) Acceso a archivos en posts publicados:
- Policy publica para lectura.

2) Avatars:
- Policy publica para lectura.

3) Signed URLs:
- No se usan (solo si cambia la decision).

## Convencion de rutas (obligatoria)

- `blog-files/{uid}/posts/{postId}/{uuid}-{filename}`
- `blog-files/{uid}/avatar/{uuid}-{filename}`
- `blog-files/{uid}/misc/{uuid}-{filename}`

Regla clave: `split_part(name, '/', 1) = auth.uid()::text`.

## Paso a paso — Implementacion

### Paso 1 — Crear bucket

En Supabase Studio → Storage:

- Create bucket: `blog-files`
- Public: **NO** (privado)

Checklist:
- [ ] Bucket `blog-files` existe
- [ ] `public = false`

### Paso 2 — Policies de Storage (SQL)

Archivo sugerido: `db/migrations/008_storage_policies.sql`

Policies requeridas:

1) Upload solo a tu carpeta (insert):
- `bucket_id = 'blog-files'` y prefijo `{uid}`.

2) Leer propios (select, authenticated):
- `bucket_id = 'blog-files'` y prefijo `{uid}`.

3) Leer archivos de posts publicados (select, anon + authenticated):
- Join con `public.files` y `public.posts` donde `status = 'published'`.

4) Leer avatars publicos (select, anon + authenticated):
- `public.public_profiles.avatar_url = storage.objects.name`.

Checklist:
- [ ] Upload restringido a carpeta propia
- [ ] Lectura propia OK
- [ ] Lectura publica solo si post published
- [ ] Lectura publica de avatars

### Paso 3 — Integracion con `public.files`

- El cliente sube con `{uid}/...` siempre.
- `public.files.object_path` debe coincidir exactamente con `storage.objects.name`.
- `public.files.bucket = 'blog-files'`.

Checklist:
- [ ] El cliente usa la convencion
- [ ] `object_path` coincide con Storage

### Paso 4 — Integracion con `public.public_profiles`

- `public.public_profiles.avatar_url` apunta al `object_path` real del avatar.
- El avatar se puede leer via policy publica.

Checklist:
- [ ] Avatar visible para `anon`
- [ ] Avatar privado si `avatar_url` es null

### Paso 5 — Verificacion

- Usuario A sube archivo → puede leerlo.
- Usuario B no puede leer archivos de A.
- `anon` puede leer archivos ligados a posts publicados.
- `anon` puede leer avatar publico.

Checklist:
- [ ] Policies se comportan como esperado

## Resultado y aprendizajes (completar al finalizar)

- Resultado: <que se logro, con referencias a comprobaciones>
- Problemas encontrados: <errores, fallos de policy, dependencias>
- Soluciones aplicadas: <que se ajusto>
- Aprendizajes: <lecciones para futuras iteraciones>
- Pendientes: <que quedo fuera>
