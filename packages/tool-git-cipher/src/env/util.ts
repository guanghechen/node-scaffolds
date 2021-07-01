import path from 'path'
import { configRootDir, templateRootDir } from './constant'

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
  return path.resolve(templateRootDir, ...filepath)
}
