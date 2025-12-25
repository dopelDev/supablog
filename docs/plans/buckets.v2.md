# Plan de acción v2 — Storage buckets + policies (Supablog)

Este documento es autónomo y puede ser ejecutado por un agente distinto a los otros planes. Está alineado con `docs/plans/create_sql.md` y define un plan paso a paso para Storage.

## Objetivo

- Crear bucket privado `blog-files`.
- Definir convención de rutas por usuario (`{uid}/...`).
- Configurar policies de `storage.objects` para lectura controlada.

## Decisiones pendientes (deben resolverse antes de ejecutar)

1) Acceso público a archivos en posts publicados:
- Opción A: policy pública para lectura.
- Opción B: signed URLs (sin policy pública).

2) Avatars:
- Opción A: policy pública para lectura.
- Opción B: signed URLs.

> Si no hay decisión, asumir Opción A (policy pública) y documentar la elección.

## Convención de rutas (obligatoria)

- `blog-files/{uid}/posts/{postId}/{uuid}-{filename}`
- `blog-files/{uid}/avatar/{uuid}-{filename}`
- `blog-files/{uid}/misc/{uuid}-{filename}`

Regla clave: `split_part(name, '/', 1) = auth.uid()::text`.

## Paso a paso — Implementación

### Paso 1 — Crear bucket

En Supabase Studio → Storage:

- Create bucket: `blog-files`
- Public: **NO** (privado)

Checklist:
- [ ] Bucket `blog-files` existe
- [ ] `public = false`

### Paso 2 — Policies de Storage (SQL)

Archivo sugerido: `db/migrations/008_storage_policies.sql`

#### 2.1 Upload solo a tu carpeta

```sql
create policy "storage: upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'blog-files'
  and split_part(name, '/', 1) = auth.uid()::text
);
```

#### 2.2 Leer propios (authenticated)

```sql
create policy "storage: read own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'blog-files'
  and split_part(name, '/', 1) = auth.uid()::text
);
```

#### 2.3 Leer archivos de posts publicados (opcional)

```sql
create policy "storage: read published post files"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'blog-files'
  and exists (
    select 1 from public.files f
    join public.posts p on p.id = f.post_id
    where f.object_path = storage.objects.name
      and f.bucket = storage.objects.bucket_id
      and p.status = 'published'
      and f.post_id is not null
  )
);
```

#### 2.4 Leer avatars públicos (opcional)

```sql
create policy "storage: read public avatars"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'blog-files'
  and exists (
    select 1
    from public.public_profiles pp
    where pp.id::text = split_part(storage.objects.name, '/', 1)
      and pp.avatar_url = storage.objects.name
  )
);
```

Checklist:
- [ ] Upload restringido a carpeta propia
- [ ] Lectura propia OK
- [ ] Lectura pública solo si post published (si aplica)
- [ ] Lectura pública de avatars (si aplica)

### Paso 3 — Validación de rutas en app

- El cliente debe subir con `{uid}/...` siempre.
- `public.files.object_path` debe coincidir exactamente con `storage.objects.name`.

Checklist:
- [ ] El cliente usa la convención
- [ ] `object_path` coincide con Storage

### Paso 4 — Alternativa signed URLs (si aplica)

Si se elige signed URLs:

- No aplicar policies públicas (2.3 y 2.4).
- Generar signed URLs en cliente o backend.
- Definir expiración y rotación.

Checklist:
- [ ] Signed URLs implementadas
- [ ] Policies públicas desactivadas

## Verificación

- Subir archivo como usuario A → debería poder leerlo.
- Usuario B no debería leer archivos de A.
- `anon` solo puede leer archivos ligados a posts publicados (si aplica).
- `anon` puede leer avatar público (si aplica).

## Resultado y aprendizajes (completar al finalizar)

- Resultado: <qué se logró, con referencias a comprobaciones>
- Problemas encontrados: <errores, fallos de policy, dependencias>
- Soluciones aplicadas: <qué se ajustó>
- Aprendizajes: <lecciones para futuras iteraciones>
- Pendientes: <qué quedó fuera>
