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
- Variables en `.env` para el admin user (ver Paso 1).

## Decisiones cerradas

1) Crear usuarios de seed:
- Opcion C: Admin API (service role key, solo dev).
- Admin user = author1 (se usa para seed).
- `email_confirm = false`.
- `ADMIN_DISPLAY_NAME` se usa como `user_metadata.full_name`.
- Author2 es opcional (solo si quieres pruebas multi-author).

2) Archivos de seed:
- Se suben archivos reales a Storage + metadata en `public.files`.

## Paso a paso — Implementacion

### Paso 1 — Configurar variables en `.env` (admin user)

Variables requeridas:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_DISPLAY_NAME`

Checklist:
- [ ] Variables definidas en `.env`

### Paso 2 — Script automatizado: crear admin user (author1)

Script sugerido (idempotente, usa Admin API):

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_URL:?}"
: "${SUPABASE_SERVICE_ROLE_KEY:?}"
: "${ADMIN_EMAIL:?}"
: "${ADMIN_PASSWORD:?}"
: "${ADMIN_DISPLAY_NAME:?}"

payload=$(cat <<JSON
{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD","email_confirm":false,"user_metadata":{"full_name":"$ADMIN_DISPLAY_NAME"}}
JSON
)

status=$(curl -sS -o /tmp/admin_user_resp -w "%{http_code}" \
  -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "$payload")

if [ "$status" = "200" ] || [ "$status" = "201" ]; then
  echo "Admin user creado"
elif [ "$status" = "422" ] || [ "$status" = "409" ]; then
  echo "Admin user ya existe"
else
  echo "Fallo al crear admin user (HTTP $status)" >&2
  cat /tmp/admin_user_resp >&2
  exit 1
fi
```

Integracion con creacion del container:
- Ejecutar el script como servicio one-shot en `docker-compose.yml` luego de levantar Supabase.
- Alternativa: correr el script despues de `docker compose up -d` en tu workflow local.

Checklist:
- [ ] Admin user creado (o ya existia) en `auth.users`
- [ ] `public.profiles` creado via trigger

### Paso 3 — Crear author2 (opcional)

Si necesitas pruebas multi-author:
- Repite el script con otro email/password/display_name.
- O crea el segundo usuario desde Studio.

Checklist:
- [ ] Author2 creado (si aplica)

### Paso 4 — Validar IDs

- Consultar `auth.users` para obtener `id` por email (usa `ADMIN_EMAIL`).
- Si faltan perfiles, hacer upsert en `public.profiles`.

Checklist:
- [ ] IDs listos
- [ ] Perfiles existentes

### Paso 5 — Insertar posts de ejemplo

Archivo sugerido: `db/seed/001_seed_app.sql`

- Insertar 1 post `draft` y al menos 1 post `published` para el admin user (author1).
- (Opcional) Un post publicado de author2 si existe.
- `published` debe setearse via RPC (no via update directo).

Checklist:
- [ ] Existe al menos 1 post `published`
- [ ] Existe al menos 1 post `draft`

### Paso 6 — Insertar comentarios de ejemplo (hidden por defecto)

- Insertar comentarios con `is_hidden = true` (default).
- Asignar comentarios a posts publicados.
- (Opcional) Usar author2 para comentar posts del admin.

Checklist:
- [ ] Comentario existe y esta oculto por defecto

### Paso 7 — Moderar comentarios via RPC

- Usar RPC `set_comment_visibility` para mostrar un comentario.
- Verificar que solo el autor del post puede moderar.

Checklist:
- [ ] Comentario visible solo tras moderacion
- [ ] Usuario no autor no puede moderar

### Paso 8 — Subir archivos reales a Storage

- Subir archivos al bucket `blog-files` usando rutas con `{uid}/...`.
- Subir al menos:
  - avatar para admin user (author1)
  - imagen para un post publicado del admin user

Checklist:
- [ ] Objetos existen en Storage
- [ ] Rutas cumplen convencion

### Paso 9 — Registrar metadata en `public.files`

- Insertar filas en `public.files` con `object_path` exacto.
- Asociar avatar y file al post correspondiente.
- Usar RPCs para adjuntar a post si aplica.

Checklist:
- [ ] `object_path` coincide con Storage
- [ ] `post_id` correcto en files del post

### Paso 10 — Verificacion con la app

- Admin user (author1) ve su draft y lo edita.
- Author2 no puede editar posts del admin (si existe).
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
