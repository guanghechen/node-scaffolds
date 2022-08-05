import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-file'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'

/**
 * Load configuration file with format .json / .yml / .yaml
 *
 * @param filepath
 * @param encoding
 * @returns
 */
export async function loadJsonOrYaml(
  filepath: string,
  encoding: BufferEncoding = 'utf8',
): Promise<unknown | never> {
  ensureCriticalFilepathExistsSync(filepath)
  const loadContent = (): Promise<string> => fs.readFile(filepath, encoding)

  let result: unknown
  const extname = path.extname(filepath)
  switch (extname) {
    case '.json': {
      const content: string = await loadContent()
      result = JSON.parse(content)
      break
    }
    case '.yml':
    case '.yaml': {
      const content: string = await loadContent()
      result = yaml.load(content, { filename: filepath, json: true })
      break
    }
    default:
      throw new Error(
        `Only files in .json / .yml / .ymal format are supported. filepath(${filepath}`,
      )
  }
  return result
}

/**
 * Load configuration file with format .json / .yml / .yaml  (synchronizing)
 *
 * @param filepath
 * @param encoding
 * @returns
 */
export function loadJsonOrYamlSync(
  filepath: string,
  encoding: BufferEncoding = 'utf8',
): unknown | never {
  ensureCriticalFilepathExistsSync(filepath)
  const loadContent = (): string => fs.readFileSync(filepath, encoding)

  let result: unknown
  const extname = path.extname(filepath)
  switch (extname) {
    case '.json': {
      const content: string = loadContent()
      result = JSON.parse(content)
      break
    }
    case '.yml':
    case '.yaml': {
      const content: string = loadContent()
      result = yaml.load(content, { filename: filepath, json: true })
      break
    }
    default:
      throw new Error(
        `Only files in .json / .yml / .ymal format are supported. filepath(${filepath}`,
      )
  }
  return result
}
