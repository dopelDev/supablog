<template>
  <section class="classifieds-box">
    <header class="header">
      <ClassifiedsRibbon><slot name="title">Classifieds</slot></ClassifiedsRibbon>
    </header>
    <div class="content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
// auto-registered por Nuxt (alias @components configurado)
</script>

<style scoped lang="scss">
@use "@styles/globals" as *;

.classifieds-box {
  position: relative;
  background: var(--color-surface);
  border: 3px double var(--color-border);
  padding: 1.75rem 1.25rem 1.25rem;

  .header {
    position: absolute; top: -1.2rem; left: 50%; transform: translateX(-50%);
  }

  .content {
    color: var(--color-text-primary);
    a { color: var(--color-link); &:hover { color: var(--color-link-hover); } }
  }
}
</style>

