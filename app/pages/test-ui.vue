<template>
  <div class="section">
    <div class="container">
      <h1 class="title is-1 mb-6">Test UI</h1>
      
      <div v-for="category in colorCategories" :key="category.name" class="mb-6">
        <h2 class="title is-3 mb-4">{{ category.name }}</h2>
        <div class="columns is-multiline">
          <div
            v-for="color in category.colors"
            :key="color.name"
            class="column is-one-quarter-desktop is-one-third-tablet is-half-mobile"
          >
            <div class="color-card box">
              <div
                class="color-swatch"
                :style="{ backgroundColor: color.value }"
              ></div>
              <div class="color-info mt-3">
                <p class="has-text-weight-bold mb-1">{{ color.name }}</p>
                <p class="is-size-7 has-text-grey">{{ color.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Fuentes -->
      <div class="mb-6">
        <h2 class="title is-3 mb-4">Google Fonts</h2>
        <div class="columns is-multiline">
          <div
            v-for="font in fonts"
            :key="font.name"
            class="column is-half-desktop is-full-tablet"
          >
            <div class="font-card box">
              <h3 class="title is-5 mb-3">{{ font.name }}</h3>
              <p class="font-designer mb-4 is-size-7 has-text-grey">
                Designed by {{ font.designer }}
              </p>
              <div :class="font.class" class="font-example">
                <p class="font-sample-text">{{ font.sample }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { isDarkMode } = useDarkMode()

const lightColors = {
  backgrounds: [
    { name: 'lm-background', value: 'hsl(45, 34%, 93%)' },
    { name: 'lm-surface', value: 'hsl(45, 26%, 91%)' },
    { name: 'lm-surface-2', value: 'hsl(45, 20%, 86%)' },
  ],
  text: [
    { name: 'lm-text-primary', value: 'hsl(0, 0%, 10%)' },
    { name: 'lm-text-secondary', value: 'hsl(0, 0%, 23%)' },
    { name: 'lm-text-muted', value: 'hsl(30, 6%, 41%)' },
  ],
  accents: [
    { name: 'lm-accent-1', value: 'hsl(39, 30%, 62%)' },
    { name: 'lm-accent-2', value: 'hsl(33, 23%, 54%)' },
    { name: 'lm-accent-3', value: 'hsl(28, 20%, 45%)' },
    { name: 'lm-accent-4', value: 'hsl(39, 22%, 69%)' },
  ],
  borders: [
    { name: 'lm-border', value: 'hsl(42, 11%, 75%)' },
    { name: 'lm-divider', value: 'hsl(42, 16%, 82%)' },
  ],
  shadows: [
    { name: 'lm-shadow', value: 'hsl(48, 3%, 66%)' },
    { name: 'lm-shadow-strong', value: 'hsl(40, 4%, 55%)' },
  ],
  links: [
    { name: 'lm-link', value: 'hsl(24, 9%, 38%)' },
    { name: 'lm-link-hover', value: 'hsl(22, 7%, 21%)' },
  ],
}

const darkColors = {
  backgrounds: [
    { name: 'dm-background', value: 'hsl(220, 10%, 8%)' },
    { name: 'dm-surface', value: 'hsl(220, 8%, 14%)' },
    { name: 'dm-surface-2', value: 'hsl(220, 7%, 20%)' },
  ],
  text: [
    { name: 'dm-text-primary', value: 'hsl(0, 0%, 96%)' },
    { name: 'dm-text-secondary', value: 'hsl(0, 0%, 78%)' },
    { name: 'dm-text-muted', value: 'hsl(220, 10%, 65%)' },
  ],
  accents: [
    { name: 'dm-accent-1', value: 'hsl(356, 92%, 54%)' },
    { name: 'dm-accent-2', value: 'hsl(19, 92%, 56%)' },
    { name: 'dm-accent-3', value: 'hsl(28, 64%, 54%)' },
    { name: 'dm-accent-4', value: 'hsl(36, 52%, 58%)' },
  ],
  borders: [
    { name: 'dm-border', value: 'hsl(220, 10%, 30%)' },
    { name: 'dm-divider', value: 'hsl(220, 10%, 24%)' },
  ],
  shadows: [
    { name: 'dm-shadow', value: 'hsl(220, 10%, 5%)' },
    { name: 'dm-shadow-strong', value: 'hsl(220, 10%, 3%)' },
  ],
  links: [
    { name: 'dm-link', value: 'hsl(356, 80%, 62%)' },
    { name: 'dm-link-hover', value: 'hsl(48, 100%, 60%)' },
  ],
}

const colorCategories = computed(() => {
  const colors = isDarkMode.value ? darkColors : lightColors
  const themeLabel = isDarkMode.value ? 'Dark' : 'Light'
  
  return [
    { name: `${themeLabel} Mode - Backgrounds`, colors: colors.backgrounds },
    { name: `${themeLabel} Mode - Text`, colors: colors.text },
    { name: `${themeLabel} Mode - Accents`, colors: colors.accents },
    { name: `${themeLabel} Mode - Borders`, colors: colors.borders },
    { name: `${themeLabel} Mode - Shadows`, colors: colors.shadows },
    { name: `${themeLabel} Mode - Links`, colors: colors.links },
  ]
})

const fonts = [
  {
    name: 'Ms Madi',
    designer: 'Robert Leuschke',
    class: 'font-ms-madi',
    sample: 'The quick brown fox jumps over the lazy dog'
  },
  {
    name: 'Fascinate Inline',
    designer: 'Astigmatic',
    class: 'font-fascinate-inline',
    sample: 'The quick brown fox jumps over the lazy dog'
  },
  {
    name: 'Gabriela',
    designer: 'Eduardo Tunni',
    class: 'font-gabriela',
    sample: 'The quick brown fox jumps over the lazy dog'
  },
  {
    name: 'Just Another Hand',
    designer: 'Astigmatic',
    class: 'font-just-another-hand',
    sample: 'The quick brown fox jumps over the lazy dog'
  }
]
</script>

<style lang="scss" scoped>
.color-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.color-swatch {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-info {
  flex: 1;
}

.font-card {
  height: 100%;
}

.font-example {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-sample-text {
  font-size: 1.5rem;
  line-height: 1.6;
  text-align: center;
}

.font-ms-madi {
  .font-sample-text {
    font-family: "Ms Madi", cursive;
    font-size: 2rem;
  }
}

.font-fascinate-inline {
  .font-sample-text {
    font-family: "Fascinate Inline", cursive;
    font-size: 1.8rem;
  }
}

.font-gabriela {
  .font-sample-text {
    font-family: "Gabriela", serif;
    font-size: 2rem;
  }
}

.font-just-another-hand {
  .font-sample-text {
    font-family: "Just Another Hand", cursive;
    font-size: 2rem;
  }
}

body.dark {
  .color-swatch {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .font-example {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
