# Sistema de Diseño - Supablog

Esta documentación explica cómo funciona el sistema de diseño del proyecto, incluyendo el manejo de colores, tipografía, Bulma y el modo oscuro.

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Sistema de Colores](#sistema-de-colores)
3. [CSS Variables](#css-variables)
4. [Modo Oscuro](#modo-oscuro)
5. [Tipografía](#tipografía)
6. [Bulma Framework](#bulma-framework)
7. [Uso en Componentes Vue](#uso-en-componentes-vue)
8. [Estructura de Archivos](#estructura-de-archivos)

---

## Arquitectura General

El sistema de diseño está construido sobre tres pilares principales:

1. **Variables SCSS** (`_colors.scss`): Define los tokens de color en formato HSL para modo claro y oscuro
2. **CSS Variables** (`_globals.scss`): Convierte los tokens SCSS en CSS variables dinámicas que cambian con `body.dark`
3. **Bulma Framework**: Proporciona estructura responsive y componentes, sin interferir con el sistema de colores

### Flujo de Estilos

```
main.scss
  ├── reset.scss (reset de estilos)
  ├── bulma-overrides.scss (Bulma con tipografía)
  ├── mixins.scss (mixins reutilizables)
  └── globals.scss (CSS variables y estilos base)
```

---

## Sistema de Colores

### Tokens de Color (SCSS)

Los colores se definen en `app/assets/styles/_colors.scss` usando variables SCSS en formato HSL.

#### Modo Claro (Light Mode)

- **Fondos**: `$lm-background`, `$lm-surface`, `$lm-surface-2`
- **Texto**: `$lm-text-primary`, `$lm-text-secondary`, `$lm-text-muted`
- **Bordes**: `$lm-border`, `$lm-divider`
- **Acentos**: `$lm-accent-1` a `$lm-accent-4`
- **Interactivos**: `$lm-link`, `$lm-link-hover`
- **Sombras**: `$lm-shadow`, `$lm-shadow-strong`

#### Modo Oscuro (Dark Mode)

- **Fondos**: `$dm-background`, `$dm-surface`, `$dm-surface-2`
- **Texto**: `$dm-text-primary`, `$dm-text-secondary`, `$dm-text-muted`
- **Bordes**: `$dm-border`, `$dm-divider`
- **Acentos**: `$dm-accent-1` a `$dm-accent-4` (colores más vibrantes)
- **Interactivos**: `$dm-link`, `$dm-link-hover`
- **Sombras**: `$dm-shadow`, `$dm-shadow-strong`

### Filosofía de Color

- **Modo Claro**: Estética vintage de periódico con tonos cálidos y apagados
- **Modo Oscuro**: Inspirado en tabloides británicos (The Sun, Daily Mirror) con colores más vibrantes y contrastados

---

## CSS Variables

### Definición

Las CSS variables se definen en `app/assets/styles/_globals.scss` y se generan automáticamente desde los tokens SCSS:

```scss
:root {
  --color-background: #{colors.$lm-background};
  --color-surface: #{colors.$lm-surface};
  --color-text-primary: #{colors.$lm-text-primary};
  // ... etc
}

body.dark {
  --color-background: #{colors.$dm-background};
  --color-surface: #{colors.$dm-surface};
  --color-text-primary: #{colors.$dm-text-primary};
  // ... etc
}
```

### Variables Disponibles

Todas las variables siguen el patrón `--color-{nombre}`:

- `--color-background`: Color de fondo principal
- `--color-surface`: Color de superficie (cards, paneles)
- `--color-surface-2`: Color de superficie elevada
- `--color-text-primary`: Texto principal
- `--color-text-secondary`: Texto secundario
- `--color-text-muted`: Texto tenue
- `--color-border`: Color de borde
- `--color-divider`: Color de divisor
- `--color-accent-1` a `--color-accent-4`: Colores de acento
- `--color-link`: Color de enlace
- `--color-link-hover`: Color de enlace al hover
- `--color-shadow`: Color de sombra suave
- `--color-shadow-strong`: Color de sombra fuerte

### Uso de CSS Variables

Las CSS variables se usan directamente en los estilos y cambian automáticamente cuando se activa `body.dark`:

```scss
.mi-componente {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

---

## Modo Oscuro

### Composable `useDarkMode`

El modo oscuro se maneja mediante el composable `app/composables/useDarkMode.ts`:

```typescript
const { isDarkMode, toggleDarkMode } = useDarkMode();
```

### Funcionalidad

1. **Detección automática**: Lee la preferencia del sistema (`prefers-color-scheme: dark`)
2. **Persistencia**: Guarda la preferencia en `localStorage`
3. **Aplicación**: Agrega/remueve la clase `dark` en `body`
4. **Sincronización**: Actualiza `data-theme` y `color-scheme`

### Cómo Funciona

Cuando se activa el modo oscuro:

1. El composable agrega la clase `dark` a `<body>`
2. Las CSS variables en `body.dark` sobrescriben las de `:root`
3. Todos los elementos que usan CSS variables se actualizan automáticamente
4. No se requiere JavaScript adicional en los componentes

### Ejemplo de Uso

```vue
<template>
  <button @click="toggleDarkMode">
    {{ isDarkMode ? 'Modo Claro' : 'Modo Oscuro' }}
  </button>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>
```

---

## Tipografía

### Fuentes Disponibles

Las fuentes se definen en `app/assets/styles/_fonts.scss`:

- **`$font-gabriela`**: Fuente principal (serif) - "Gabriela"
- **`$font-fascinate-inline`**: Fuente de acento - "Fascinate Inline"
- **`$font-just-another-hand`**: Fuente manuscrita - "Just Another Hand"
- **`$font-ms-madi`**: Fuente decorativa - "Ms Madi"

### Configuración en Bulma

La tipografía se configura en `app/assets/styles/_bulma-overrides.scss`:

```scss
@use "bulma/sass/utilities" with (
  $family-primary: fonts.$font-gabriela
);
```

Esto hace que Bulma use "Gabriela" como fuente principal en todos sus componentes.

### Uso en Componentes

```scss
@use "@styles/fonts" as *;

.titulo {
  font-family: $font-gabriela;
}

.decorativo {
  font-family: $font-fascinate-inline;
}
```

---

## Bulma Framework

### Configuración

Bulma se importa en `app/assets/styles/_bulma-overrides.scss` **solo con configuración de tipografía**, sin colores personalizados:

```scss
@use "@styles/fonts" as fonts;

@use "bulma/sass/utilities" with (
  $family-primary: fonts.$font-gabriela
);

@forward "bulma/sass";
```

### Qué Proporciona Bulma

- **Estructura responsive**: Grid system, columns, containers
- **Componentes**: Cards, buttons, modals, navbar, etc.
- **Utilidades**: Spacing, typography helpers, etc.

### Qué NO Usa Bulma

- **Colores**: Los colores se manejan completamente con CSS variables en los componentes
- **Temas**: No se configuran temas de color en Bulma

### Uso de Clases Bulma

```vue
<template>
  <div class="container">
    <div class="columns">
      <div class="column is-half">
        <div class="card">
          <div class="card-content">
            <p class="title">Título</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

Las clases de Bulma funcionan normalmente, pero los colores se definen con CSS variables en el SCSS del componente.

---

## Uso en Componentes Vue

### Importar Globals

Para usar las CSS variables en un componente, importa `globals`:

```vue
<style scoped lang="scss">
@use "@styles/globals" as *;

.mi-componente {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
}
</style>
```

### Ejemplo Completo

```vue
<template>
  <div class="card">
    <div class="card-content">
      <p class="title">Título</p>
      <p class="content">Contenido del card</p>
      <a href="#" class="link">Enlace</a>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@styles/globals" as *;

.card {
  // Usar CSS variables que cambian automáticamente con body.dark
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px var(--color-shadow);
  
  .title {
    color: var(--color-accent-1);
  }
  
  .content {
    color: var(--color-text-secondary);
  }
  
  .link {
    color: var(--color-link);
    
    &:hover {
      color: var(--color-link-hover);
    }
  }
}
</style>
```

### Combinar Bulma y CSS Variables

```vue
<template>
  <div class="card custom-card">
    <div class="card-content">
      <p class="title">Título</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@styles/globals" as *;

// Bulma proporciona la estructura (.card, .card-content)
// CSS variables proporcionan los colores
.custom-card {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  
  .title {
    color: var(--color-accent-1);
  }
}
</style>
```

---

## Estructura de Archivos

```
app/assets/styles/
├── main.scss                 # Punto de entrada principal
├── _bulma-overrides.scss     # Configuración de Bulma (solo tipografía)
├── _colors.scss              # Tokens de color (SCSS variables)
├── _fonts.scss               # Definición de fuentes
├── _globals.scss             # CSS variables y estilos base
├── _mixins.scss              # Mixins reutilizables
├── _reset.scss               # Reset de estilos
└── vintage.scss              # Estilos vintage adicionales
```

### Descripción de Archivos

- **`main.scss`**: Orquesta la carga de todos los estilos
- **`_bulma-overrides.scss`**: Configura Bulma sin colores
- **`_colors.scss`**: Define todos los tokens de color en SCSS
- **`_fonts.scss`**: Define las fuentes del proyecto
- **`_globals.scss`**: Convierte tokens SCSS a CSS variables y define estilos base
- **`_mixins.scss`**: Mixins reutilizables para el proyecto
- **`_reset.scss`**: Normalización de estilos

---

## Mejores Prácticas

### ✅ Hacer

- Usar CSS variables (`var(--color-*)`) en los componentes Vue
- Importar `globals` en el SCSS de los componentes para tener acceso a las variables
- Usar las clases de Bulma para estructura y componentes
- Definir colores con CSS variables para que cambien automáticamente con el modo oscuro

### ❌ Evitar

- No configurar colores en Bulma (solo tipografía)
- No usar valores de color hardcodeados en los componentes
- No importar `colors` directamente en componentes (usar `globals` para CSS variables)
- No sobrescribir estilos de Bulma globalmente (hacerlo en componentes específicos)

---

## Ejemplos de Uso

### Botón con Colores Dinámicos

```vue
<template>
  <button class="custom-button">Click me</button>
</template>

<style scoped lang="scss">
@use "@styles/globals" as *;

.custom-button {
  background-color: var(--color-accent-1);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  
  &:hover {
    background-color: var(--color-accent-2);
  }
}
</style>
```

### Card con Estilos Personalizados

```vue
<template>
  <div class="card custom-card">
    <div class="card-header">
      <p class="card-header-title">Título</p>
    </div>
    <div class="card-content">
      <p>Contenido</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@styles/globals" as *;

.custom-card {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  
  .card-header {
    background-color: var(--color-surface-2);
    border-bottom: 1px solid var(--color-divider);
    
    .card-header-title {
      color: var(--color-accent-1);
    }
  }
  
  .card-content {
    color: var(--color-text-primary);
  }
}
</style>
```

---

## Resumen

El sistema de diseño está diseñado para:

1. **Separación de responsabilidades**: Bulma para estructura, CSS variables para colores
2. **Flexibilidad**: Cada componente decide qué colores usar
3. **Consistencia**: Todos los colores provienen de un sistema centralizado
4. **Dinamismo**: Los colores cambian automáticamente con el modo oscuro
5. **Mantenibilidad**: Cambios en `_colors.scss` se reflejan en todo el proyecto

Para más información sobre cómo usar Bulma, consulta la [documentación oficial de Bulma](https://bulma.io/documentation/).
