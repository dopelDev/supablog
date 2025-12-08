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
                :class="`color-swatch color-swatch--${color.cssVar}`"
                :data-css-var="color.cssVar"
              ></div>
              <div class="color-info mt-3">
                <p class="has-text-weight-bold mb-1">{{ color.name }}</p>
                <p class="is-size-7 has-text-grey color-value" :data-css-var="color.cssVar">
                  {{ getColorValue(color.cssVar) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Componentes UI -->
      <div class="mb-6">
        <h2 class="title is-3 mb-4">UI Components</h2>
        
        <!-- ClassifiedsRibbon -->
        <div class="mb-6">
          <h3 class="title is-4 mb-4">ClassifiedsRibbon</h3>
          <div class="columns is-multiline">
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Default Ribbon (slot vacío muestra "CLASSIFIEDS"):</p>
                <ClassifiedsRibbon />
              </div>
            </div>
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Custom Text usando slot:</p>
                <ClassifiedsRibbon>NEWS & UPDATES</ClassifiedsRibbon>
              </div>
            </div>
            <div class="column is-half">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Otro ejemplo de texto personalizado:</p>
                <ClassifiedsRibbon>ANNOUNCEMENTS</ClassifiedsRibbon>
              </div>
            </div>
            <div class="column is-half">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Más variaciones:</p>
                <ClassifiedsRibbon>SPECIAL OFFERS</ClassifiedsRibbon>
              </div>
            </div>
          </div>
        </div>

        <!-- ArrowDivider -->
        <div class="mb-6">
          <h3 class="title is-4 mb-4">ArrowDivider</h3>
          <div class="columns is-multiline">
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Default Divider (flechas en ambos extremos):</p>
                <ArrowDivider />
              </div>
            </div>
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Entre secciones de contenido:</p>
                <p class="mb-4">Contenido superior</p>
                <ArrowDivider />
                <p class="mt-4">Contenido inferior</p>
              </div>
            </div>
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Múltiples dividers:</p>
                <ArrowDivider />
                <ArrowDivider />
                <ArrowDivider />
              </div>
            </div>
          </div>
        </div>

        <!-- ClassifiedsBox -->
        <div class="mb-6">
          <h3 class="title is-4 mb-4">ClassifiedsBox</h3>
          <div class="columns is-multiline">
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Default Box (título "Classifieds"):</p>
                <ClassifiedsBox>
                  <p>Contenido del box de clasificados. Aquí puedes poner cualquier contenido.</p>
                </ClassifiedsBox>
              </div>
            </div>
            <div class="column is-full">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Con título personalizado usando slot "title":</p>
                <ClassifiedsBox>
                  <template #title>NEWS & UPDATES</template>
                  <p>Este box tiene un título personalizado en el ribbon.</p>
                  <p class="mt-2">Puedes agregar múltiples párrafos y contenido aquí.</p>
                </ClassifiedsBox>
              </div>
            </div>
            <div class="column is-half">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Box con contenido variado:</p>
                <ClassifiedsBox>
                  <template #title>ANNOUNCEMENTS</template>
                  <ul>
                    <li>Primer anuncio importante</li>
                    <li>Segundo anuncio</li>
                    <li>Tercer anuncio</li>
                  </ul>
                </ClassifiedsBox>
              </div>
            </div>
            <div class="column is-half">
              <div class="box">
                <p class="mb-4 has-text-weight-bold">Box con enlaces:</p>
                <ClassifiedsBox>
                  <template #title>LINKS</template>
                  <p>
                    <a href="#">Enlace de ejemplo 1</a> | 
                    <a href="#">Enlace de ejemplo 2</a>
                  </p>
                </ClassifiedsBox>
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
import { computed, onMounted, ref, watch } from 'vue'

const { isDarkMode } = useDarkMode()

// Estructura simple con nombres de colores y sus CSS variables correspondientes
const colorDefinitions = {
  backgrounds: [
    { name: 'background', cssVar: 'background' },
    { name: 'surface', cssVar: 'surface' },
    { name: 'surface-2', cssVar: 'surface-2' },
  ],
  text: [
    { name: 'text-primary', cssVar: 'text-primary' },
    { name: 'text-secondary', cssVar: 'text-secondary' },
    { name: 'text-muted', cssVar: 'text-muted' },
  ],
  accents: [
    { name: 'accent-1', cssVar: 'accent-1' },
    { name: 'accent-2', cssVar: 'accent-2' },
    { name: 'accent-3', cssVar: 'accent-3' },
    { name: 'accent-4', cssVar: 'accent-4' },
  ],
  borders: [
    { name: 'border', cssVar: 'border' },
    { name: 'divider', cssVar: 'divider' },
  ],
  shadows: [
    { name: 'shadow', cssVar: 'shadow' },
    { name: 'shadow-strong', cssVar: 'shadow-strong' },
  ],
  links: [
    { name: 'link', cssVar: 'link' },
    { name: 'link-hover', cssVar: 'link-hover' },
  ],
}

// Función para leer valores desde CSS variables
const getColorValue = (cssVar: string): string => {
  if (typeof window === 'undefined') {
    return ''
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${cssVar}`)
    .trim()
  return value || ''
}

// Valores reactivos para los colores actuales
const colorValues = ref<Record<string, string>>({})

// Función para actualizar todos los valores
const updateColorValues = () => {
  const values: Record<string, string> = {}
  Object.values(colorDefinitions).forEach(category => {
    category.forEach(color => {
      values[color.cssVar] = getColorValue(color.cssVar)
    })
  })
  colorValues.value = values
}

// Actualizar cuando cambie el modo oscuro
watch(isDarkMode, () => {
  setTimeout(updateColorValues, 50)
})

// Actualizar al montar
onMounted(() => {
  updateColorValues()
})

const colorCategories = computed(() => {
  const themeLabel = isDarkMode.value ? 'Dark' : 'Light'
  const prefix = isDarkMode.value ? 'dm' : 'lm'
  
  return Object.entries(colorDefinitions).map(([category, colors]) => ({
    name: `${themeLabel} Mode - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    colors: colors.map(color => ({
      name: `${prefix}-${color.name}`,
      cssVar: color.cssVar,
    })),
  }))
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
@use "@styles/globals" as *;

.color-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.color-swatch {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  border: 1px solid var(--color-border);

  // Clases dinámicas para cada color usando CSS variables
  &--background {
    background-color: var(--color-background);
  }

  &--surface {
    background-color: var(--color-surface);
  }

  &--surface-2 {
    background-color: var(--color-surface-2);
  }

  &--text-primary {
    background-color: var(--color-text-primary);
  }

  &--text-secondary {
    background-color: var(--color-text-secondary);
  }

  &--text-muted {
    background-color: var(--color-text-muted);
  }

  &--accent-1 {
    background-color: var(--color-accent-1);
  }

  &--accent-2 {
    background-color: var(--color-accent-2);
  }

  &--accent-3 {
    background-color: var(--color-accent-3);
  }

  &--accent-4 {
    background-color: var(--color-accent-4);
  }

  &--border {
    background-color: var(--color-border);
  }

  &--divider {
    background-color: var(--color-divider);
  }

  &--shadow {
    background-color: var(--color-shadow);
  }

  &--shadow-strong {
    background-color: var(--color-shadow-strong);
  }

  &--link {
    background-color: var(--color-link);
  }

  &--link-hover {
    background-color: var(--color-link-hover);
  }
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
