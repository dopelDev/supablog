<template>
  <div class="decorative-header-line">
    <div class="decorative-arrow">→</div>
    <div class="decorative-line"></div>
  </div>
</template>

<script setup lang="ts">
// Línea decorativa con flecha para la cabecera
</script>

<style lang="scss" scoped>
@use "@styles/colors" as *;

.decorative-header-line {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
}

.decorative-arrow {
  font-size: 1.5rem;
  color: $lm-accent-3;
  margin-right: 0.5rem;
  font-weight: bold;
}

.decorative-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(
    to right,
    $lm-accent-3,
    transparent
  );
  
  body.dark & {
    background: linear-gradient(
      to right,
      $dm-accent-3,
      transparent
    );
  }
}

body.dark {
  .decorative-arrow {
    color: $dm-accent-3;
  }
}
</style>
