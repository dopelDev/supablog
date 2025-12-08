// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { scssAliasPlugin } from './vite-scss-alias'

const stylesPath = fileURLToPath(new URL('./app/assets/styles', import.meta.url))
const componentsPath = fileURLToPath(new URL('./app/components', import.meta.url))
const layoutsPath = fileURLToPath(new URL('./app/layouts', import.meta.url))
const composablesPath = fileURLToPath(new URL('./app/composables', import.meta.url))
const pagesPath = fileURLToPath(new URL('./app/pages', import.meta.url))
const pluginsPath = fileURLToPath(new URL('./plugins', import.meta.url))
const appPath = fileURLToPath(new URL('./app', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.scss'],
  
  // Configurar directorios personalizados usando las rutas resueltas
  components: [
    {
      path: componentsPath,
      pathPrefix: false
    }
  ],
  
  // Configurar otros directorios usando las rutas resueltas
  dir: {
    layouts: layoutsPath,
    composables: composablesPath,
    pages: pagesPath,
    plugins: pluginsPath
  },
  
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Ms+Madi&family=Fascinate+Inline&family=Gabriela&family=Just+Another+Hand&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  },
  vite: {
    plugins: [scssAliasPlugin()],
    css: {
      preprocessorOptions: {
        scss: {
          // @ts-ignore - includePaths is valid for Sass
          includePaths: [stylesPath, componentsPath],
          additionalData: ''
        }
      }
    },
    resolve: {
      alias: {
        '@styles': stylesPath,
        '@components': componentsPath,
        '@layouts': layoutsPath,
        '@composables': composablesPath,
        '@pages': pagesPath,
        '@plugins': pluginsPath,
        '@app': appPath
      }
    }
  }
})