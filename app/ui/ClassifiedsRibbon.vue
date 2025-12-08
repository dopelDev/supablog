<template>
  <div class="ribbon"><slot>CLASSIFIEDS</slot></div>
</template>

<style scoped lang="scss">
@use "@styles/globals" as *;

.ribbon {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-4));
  color: var(--color-text-primary);
  letter-spacing: .2em;
  text-transform: uppercase;
  border: 2px solid var(--color-border);
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute; top: 0; width: 0; height: 0; border-style: solid;
  }
  &::before {
    left: -14px; border-width: 0 14px 24px 0;
    border-color: transparent var(--color-accent-4) transparent transparent;
  }
  &::after {
    right: -14px; border-width: 24px 14px 0 0;
    border-color: var(--color-accent-4) transparent transparent transparent;
  }
}
</style>

