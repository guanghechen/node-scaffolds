import path from 'node:path'
import url from 'node:url'

// Config files root dir
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
const boilerplateRootDir = path.join(configRootDir, 'boilerplates')

/**
 * Calc absolute path of configs
 * @param filepath
 */
export function resolveConfigFilepath(...filepath: string[]): string {
  return path.resolve(configRootDir, ...filepath)
}

/**
 * Calc absolute path of template files
 * @param filepath
 */
export function resolveTemplateFilepath(...filepath: string[]): string {
  return path.resolve(boilerplateRootDir, ...filepath)
}
