import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const stylesPath = fileURLToPath(new URL('./app/assets/styles', import.meta.url))
const componentsPath = fileURLToPath(new URL('./app/components', import.meta.url))

export function scssAliasPlugin(): Plugin {
  return {
    name: 'scss-alias',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id.startsWith('@styles/') && importer?.endsWith('.scss')) {
        const relativePath = id.replace('@styles/', '')
        const resolvedPath = path.resolve(stylesPath, relativePath)
        return resolvedPath
      }
      if (id.startsWith('@components/') && importer?.endsWith('.scss')) {
        const relativePath = id.replace('@components/', '')
        const resolvedPath = path.resolve(componentsPath, relativePath)
        return resolvedPath
      }
      return null
    }
  }
}
