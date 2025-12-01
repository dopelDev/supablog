<template>
  <div>
    <nav class="navbar is-transparent is-spaced px-4">
      <div class="navbar-brand">
        <a class="navbar-item" href="#">
          <span class="tag is-white is-medium mr-2">Supablog</span>
          <span class="has-text-weight-semibold has-text-dark">Nuxt + Supabase</span>
        </a>
      </div>
      <div class="navbar-menu is-active">
        <div class="navbar-end">
          <a class="navbar-item" href="https://nuxt.com" target="_blank" rel="noreferrer">Nuxt</a>
          <a class="navbar-item" href="https://bulma.io" target="_blank" rel="noreferrer">Bulma</a>
          <a class="navbar-item" href="https://supabase.com/docs" target="_blank" rel="noreferrer">Supabase</a>
        </div>
      </div>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>
