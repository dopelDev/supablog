<template>
  <section class="hero is-primary is-medium">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-half">
            <p class="tag is-soft is-medium">Vue 3 + Vite + Nuxt + Bulma</p>
            <h1 class="title is-1 mt-4">Supablog listo para despegar</h1>
            <p class="subtitle is-4 has-text-light">
              Estilos con Bulma/SCSS, runtime config para Supabase y un stack dockerizado para tu API y base de datos.
            </p>
            <div class="buttons mt-5">
              <a class="button is-white is-inverted is-outlined" href="http://localhost:54321" target="_blank" rel="noreferrer">
                Panel API local
              </a>
              <a class="button is-light is-outlined" href="http://localhost:54323" target="_blank" rel="noreferrer">
                Supabase Studio
              </a>
            </div>
          </div>
          <div class="column">
            <div class="glass-panel p-5">
              <p class="has-text-weight-semibold mb-3">Checklist de arranque</p>
              <ul>
                <li class="mb-2">1. Copia <code>.env.example</code> → <code>.env</code> y ajusta las claves.</li>
                <li class="mb-2">2. <code>docker compose up -d</code> para levantar Supabase local.</li>
                <li class="mb-2">3. Ejecuta <code>npm run dev</code> y usa la URL/keys desde <code>.env</code>.</li>
              </ul>
              <div class="mt-4">
                <p class="is-size-7 has-text-grey">Runtime config (lectura en cliente):</p>
                <pre class="mt-2"><code>URL: {{ supabaseUrl }}
ANON: {{ anonKeyPreview }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half">
          <div class="glass-panel p-5">
            <p class="title is-4 mb-2">Cliente Supabase</p>
            <p class="subtitle is-6">Ya disponible en los plugins. Usa <code>useSupabaseClient()</code> o <code>useNuxtApp().$supabase</code>.</p>
            <div class="is-size-7 mt-3">
              <p class="has-text-grey mb-2">Ejemplo:</p>
              <pre><code>const supabase = useSupabaseClient()
const { data, error } = await supabase
  .from('posts')
  .select('*')</code></pre>
            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="glass-panel p-5">
            <p class="title is-4 mb-2">Servicios docker</p>
            <p class="subtitle is-6">Base de datos, Auth, Rest, Realtime, Storage y Studio detrás de un gateway Nginx.</p>
            <ul class="mt-3">
              <li>API gateway: <code>http://localhost:54321</code></li>
              <li>Studio: <code>http://localhost:54323</code></li>
              <li>Postgres: <code>localhost:5432</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const supabaseUrl = computed(() => config.public.supabaseUrl)
const anonKeyPreview = computed(() =>
  config.public.supabaseAnonKey ? `${config.public.supabaseAnonKey.slice(0, 12)}...` : ''
)
</script>
