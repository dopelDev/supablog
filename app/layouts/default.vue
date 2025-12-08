<template>
  <div class="app-wrapper">
    <nav class="navbar is-transparent is-spaced px-4" style="z-index: 100;">
      <div class="navbar-brand">
        <NuxtLink class="navbar-item" to="/">
          <span class="tag is-white is-medium mr-2">Supablog</span>
        </NuxtLink>
      </div>
      <div class="navbar-menu is-active">
        <div class="navbar-start">
          <NuxtLink class="navbar-item" to="/test-ui">
            Test UI
          </NuxtLink>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <button 
              class="button is-ghost" 
              @click="toggleDarkMode"
              :aria-label="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <span class="icon">
                <span v-if="!isDarkMode">🌙</span>
                <span v-else>☀️</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>
