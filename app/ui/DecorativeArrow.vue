<template>
  <div
    class="decorative-arrow"
    :data-dir="direction"
    :style="{
      '--da-length': length,
      '--da-color': color,
      '--da-thickness': thickness + 'px',
      '--da-gap': gap
    }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
type Dir = 'left' | 'right' | 'both'
const props = withDefaults(defineProps<{
  direction?: Dir
  length?: string    // p.ej. '100%', '320px', '20rem'
  thickness?: number
  color?: string
  gap?: string       // separación hacia el borde
}>(), {
  direction: 'both',
  length: '100%',
  thickness: 2,
  color: 'hsl(30, 20%, 20%)',
  gap: '0.75rem'
})
</script>

<style scoped lang="scss">
.decorative-arrow {
  position: relative;
  width: var(--da-length);
  height: var(--da-thickness);
  background: var(--da-color);
  opacity: .85;
  margin-inline: var(--da-gap);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    border: var(--da-thickness) solid transparent;
  }

  &[data-dir='left'],
  &[data-dir='both'] {
    &::before {
      left: calc(-1 * var(--da-gap));
      border-right-color: var(--da-color);
      border-left-width: 0;
    }
  }

  &[data-dir='right'],
  &[data-dir='both'] {
    &::after {
      right: calc(-1 * var(--da-gap));
      border-left-color: var(--da-color);
      border-right-width: 0;
    }
  }

  /* sutil desgaste tipo periódico */
  mask-image: radial-gradient(100% 100% at 50% 50%, #000 60%, rgba(0,0,0,.9) 80%, transparent 100%);
}
</style>

