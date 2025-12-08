<template>
  <div class="app-wrapper">
    <div class="dark-mode-toggle-container">
      <button 
        class="button is-ghost dark-mode-button" 
        @click="toggleDarkMode"
        :aria-label="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <span class="icon">
          <span v-if="!isDarkMode">🌙</span>
          <span v-else>☀️</span>
        </span>
      </button>
    </div>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>

<style lang="scss" scoped>
.dark-mode-toggle-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.dark-mode-button {
  padding: 0.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .icon {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  body.dark & {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
