# Plan de acción v2 — Seed data (Supablog)

Este documento es autónomo y puede ser ejecutado por un agente distinto a los otros planes. Está alineado con `docs/plans/create_sql.md` y define un plan paso a paso para poblar datos de ejemplo.

## Objetivo

- Poblar datos de ejemplo reproducibles para desarrollo.
- Validar flujos reales con RLS activo.
- Incluir posts `draft` y `published`, comments y files.

## Pre-requisitos

- Esquema + RLS + policies implementados (ver `DB_RLS_RPC_tringgers.v2.md`).
- Bucket y policies de Storage implementados (ver `buckets.v2.md`).
- Supabase local corriendo.

## Decisiones pendientes (deben resolverse antes de ejecutar)

1) Crear usuarios de seed:
- Opción A: manual en Studio.
- Opción B: desde la app.
- Opción C: Admin API (service role key, solo dev).

2) Archivos de seed:
- ¿Se subirán archivos reales a Storage o solo metadata en `public.files`?

> Si no hay decisión, asumir Opción A (manual) y sin archivos reales.

## Paso a paso — Implementación

### Paso 1 — Crear usuarios de seed

Usuarios sugeridos:
- `author1@example.com`
- `author2@example.com`

Opción A (manual): Studio → Authentication → Users → Add user.

Checklist:
- [ ] Usuarios existen en `auth.users`
- [ ] `public.profiles` creado por trigger (o upsert manual)

### Paso 2 — Validar IDs

Query para ver IDs:

```sql
select id, email
from auth.users
order by created_at desc;
```

Si faltan perfiles:

```sql
insert into public.profiles (id, email, display_name, avatar_url)
select u.id, u.email, split_part(u.email, '@', 1), ''
from auth.users u
where u.email in ('author1@example.com', 'author2@example.com')
on conflict (id) do nothing;
```

Checklist:
- [ ] IDs listos
- [ ] Perfiles existentes

### Paso 3 — Insertar posts de ejemplo

Archivo sugerido: `db/seed/001_seed_app.sql`

Ejemplo de seed (re-ejecutable):

```sql
-- Limpieza
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

-- Publicar
update public.posts set status = 'published'
where title in ('Seed: Published Hello Supablog', 'Seed: Published Another Author');
```

Checklist:
- [ ] Existe al menos 1 post `published`
- [ ] Existe al menos 1 post `draft`

### Paso 4 — Insertar comentarios de ejemplo

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
- [ ] Comentario visible en post publicado

### Paso 5 — Seed de Storage + `public.files` (opcional)

Si se suben archivos reales:

- Subir a `blog-files/{uid}/...`.
- Insertar fila en `public.files` con `object_path` exacto.

Ejemplo de insert:

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
```

Checklist:
- [ ] `public.files.object_path` coincide con Storage
- [ ] Lectura según policies (public o signed URL)

### Paso 6 — Verificación con la app

- Author1 ve su draft y lo edita.
- Author2 no puede editar posts de Author1.
- Visitante (anon) ve posts publicados.

Checklist:
- [ ] RLS se comporta como esperado

## Resultado y aprendizajes (completar al finalizar)

- Resultado: <qué se logró, con referencias a comprobaciones>
- Problemas encontrados: <errores, fallos de policy, dependencias>
- Soluciones aplicadas: <qué se ajustó>
- Aprendizajes: <lecciones para futuras iteraciones>
- Pendientes: <qué quedó fuera>
