<template>
  <div class="arrow-divider" role="presentation"></div>
</template>

<style scoped lang="scss">
@use "@styles/globals" as *;

.arrow-divider {
  position: relative;
  height: 2px;
  background: var(--color-divider);
  margin: 1.25rem 1rem;

  &::before,
  &::after {
    content: "";
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 0; height: 0; border-style: solid;
  }
  &::before {
    left: -12px; border-width: 6px 10px 6px 0;
    border-color: transparent var(--color-border) transparent transparent;
  }
  &::after {
    right: -12px; border-width: 6px 0 6px 10px;
    border-color: transparent transparent transparent var(--color-border);
  }
}
</style>

