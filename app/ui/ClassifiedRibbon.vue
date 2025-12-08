<template>
  <figure
    class="classifieds-ribbon"
    :class="{ 'has-shadow': shadow }"
    :style="{ '--rib-fill': fill, '--rib-stroke': stroke, '--rib-text': textColor }"
    role="img"
    :aria-label="label"
  >
    <svg :width="width" :height="height" viewBox="0 0 320 90" xmlns="http://www.w3.org/2000/svg">
      <!-- colas laterales -->
      <path d="M10,45 L40,30 L40,60 Z" fill="var(--rib-fill)" stroke="var(--rib-stroke)" stroke-width="2"/>
      <path d="M310,45 L280,30 L280,60 Z" fill="var(--rib-fill)" stroke="var(--rib-stroke)" stroke-width="2"/>
      <!-- pliegues sombreados -->
      <path d="M40,30 L60,40 L60,50 L40,60 Z" fill="rgba(0,0,0,.06)"/>
      <path d="M280,30 L260,40 L260,50 L280,60 Z" fill="rgba(0,0,0,.06)"/>
      <!-- cuerpo principal con doble borde -->
      <rect x="55" y="20" width="210" height="50" rx="8" ry="8"
            fill="var(--rib-fill)" stroke="var(--rib-stroke)" stroke-width="2"/>
      <rect x="60" y="25" width="200" height="40" rx="6" ry="6"
            fill="transparent" stroke="var(--rib-stroke)" stroke-width="1.5" />
      <!-- texto -->
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="'Gabriela', serif"
            font-size="22" fill="var(--rib-text)" letter-spacing="2" font-weight="700">
        {{ label }}
      </text>
    </svg>
  </figure>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  fill?: string
  stroke?: string
  textColor?: string
  width?: number
  height?: number
  shadow?: boolean
}>(), {
  label: 'CLASSIFIEDS',
  fill: '#efe3c4',
  stroke: '#b09662',
  textColor: '#2a231b',
  width: 320,
  height: 90,
  shadow: true
})
</script>

<style scoped lang="scss">
@use "@styles/colors" as *;
@use "@styles/fonts" as *;
.classifieds-ribbon {
  display: inline-block;
  filter: saturate(.95);

  &.has-shadow {
    filter: drop-shadow(0 1px 0 rgba(0,0,0,.15)) drop-shadow(0 6px 10px rgba(0,0,0,.08));
  }
}
</style>

