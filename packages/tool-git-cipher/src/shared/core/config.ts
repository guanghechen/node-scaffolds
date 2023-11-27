import path from 'node:path'
import url from 'node:url'

// Template files root dir
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const boilerplateRootDir = path.join(__dirname, '../../boilerplates')

// Calc absolute path of template files
export function resolveBoilerplateFilepath(...filepath: string[]): string {
  return path.resolve(boilerplateRootDir, ...filepath)
}
