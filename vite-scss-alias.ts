import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { existsSync } from 'node:fs'

const stylesPath = fileURLToPath(new URL('./app/assets/styles', import.meta.url))
const componentsPath = fileURLToPath(new URL('./app/components', import.meta.url))

function resolveScssFile(basePath: string, relativePath: string): string | null {
  // Normalizar: quitar extensión si existe
  const nameWithoutExt = relativePath.replace(/\.scss$/, '')
  
  // Intentar diferentes variaciones en orden de preferencia
  const variations = [
    // Con prefijo _ y extensión .scss (más común para partials)
    `_${nameWithoutExt}.scss`,
    // Sin prefijo _ pero con extensión .scss
    `${nameWithoutExt}.scss`,
    // Con prefijo _ sin extensión
    `_${nameWithoutExt}`,
    // Sin prefijo _ ni extensión
    nameWithoutExt
  ]
  
  for (const variation of variations) {
    const fullPath = path.resolve(basePath, variation)
    if (existsSync(fullPath)) {
      return fullPath
    }
  }
  
  // Si no se encuentra, devolver la variación más común (con _ y .scss)
  return path.resolve(basePath, `_${nameWithoutExt}.scss`)
}

export function scssAliasPlugin(): Plugin {
  return {
    name: 'scss-alias',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id.startsWith('@styles/') && importer?.endsWith('.scss')) {
        const relativePath = id.replace('@styles/', '')
        const resolvedPath = resolveScssFile(stylesPath, relativePath)
        return resolvedPath
      }
      if (id.startsWith('@components/') && importer?.endsWith('.scss')) {
        const relativePath = id.replace('@components/', '')
        const resolvedPath = resolveScssFile(componentsPath, relativePath)
        return resolvedPath
      }
      return null
    }
  }
}
