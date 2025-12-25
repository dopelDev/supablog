# Plan de accion v3 — Seed data (Supablog)

Este documento es autonomo y puede ser ejecutado por un agente distinto a los otros planes. Esta alineado con `docs/plans/create_sql.md` y define un plan paso a paso para poblar datos de ejemplo con decisiones cerradas.

## Objetivo

- Poblar datos de ejemplo reproducibles para desarrollo.
- Validar flujos reales con RLS activo.
- Incluir posts `draft` y `published`, comments y files reales en Storage.

## Pre-requisitos

- Esquema + RLS + policies implementados (ver `DB_RLS_RPC_tringgers.v3.md`).
- Bucket y policies de Storage implementados (ver `buckets.v3.md`).
- Supabase local corriendo.

## Decisiones cerradas

1) Crear usuarios de seed:
- Opcion C: Admin API (service role key, solo dev).

2) Archivos de seed:
- Se suben archivos reales a Storage + metadata en `public.files`.

## Paso a paso — Implementacion

### Paso 1 — Crear usuarios de seed (Admin API)

Usuarios sugeridos:
- `author1@example.com`
- `author2@example.com`

Accion:
- Crear usuarios via Admin API con `SUPABASE_SERVICE_ROLE_KEY`.
- Confirmar que existen en `auth.users`.
- Verificar que `public.profiles` se creo via trigger.

Checklist:
- [ ] Usuarios existen en `auth.users`
- [ ] `public.profiles` creado

### Paso 2 — Validar IDs

- Consultar `auth.users` para obtener `id` por email.
- Si faltan perfiles, hacer upsert en `public.profiles`.

Checklist:
- [ ] IDs listos
- [ ] Perfiles existentes

### Paso 3 — Insertar posts de ejemplo

Archivo sugerido: `db/seed/001_seed_app.sql`

- Insertar 1 post `draft` y al menos 1 post `published`.
- `published` debe setearse via RPC (no via update directo).

Checklist:
- [ ] Existe al menos 1 post `published`
- [ ] Existe al menos 1 post `draft`

### Paso 4 — Insertar comentarios de ejemplo (hidden por defecto)

- Insertar comentarios con `is_hidden = true` (default).
- Asignar comentarios a posts publicados.

Checklist:
- [ ] Comentario existe y esta oculto por defecto

### Paso 5 — Moderar comentarios via RPC

- Usar RPC `set_comment_visibility` para mostrar un comentario.
- Verificar que solo el autor del post puede moderar.

Checklist:
- [ ] Comentario visible solo tras moderacion
- [ ] Usuario no autor no puede moderar

### Paso 6 — Subir archivos reales a Storage

- Subir archivos al bucket `blog-files` usando rutas con `{uid}/...`.
- Subir al menos:
  - avatar para `author1`
  - imagen para un post publicado de `author1`

Checklist:
- [ ] Objetos existen en Storage
- [ ] Rutas cumplen convencion

### Paso 7 — Registrar metadata en `public.files`

- Insertar filas en `public.files` con `object_path` exacto.
- Asociar avatar y file al post correspondiente.
- Usar RPCs para adjuntar a post si aplica.

Checklist:
- [ ] `object_path` coincide con Storage
- [ ] `post_id` correcto en files del post

### Paso 8 — Verificacion con la app

- Author1 ve su draft y lo edita.
- Author2 no puede editar posts de Author1.
- Visitante (anon) ve posts publicados y comentarios visibles.
- Visitante puede ver archivos de posts publicados y avatar publico.

Checklist:
- [ ] RLS se comporta como esperado

## Resultado y aprendizajes (completar al finalizar)

- Resultado: <que se logro, con referencias a comprobaciones>
- Problemas encontrados: <errores, fallos de policy, dependencias>
- Soluciones aplicadas: <que se ajusto>
- Aprendizajes: <lecciones para futuras iteraciones>
- Pendientes: <que quedo fuera>
