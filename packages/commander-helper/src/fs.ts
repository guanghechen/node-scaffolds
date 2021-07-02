import { isFileSync } from '@guanghechen/file-helper'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'

/**
 * Load configuration file with format .json / .yml / .yaml
 *
 * @param filepath
 * @param logger
 */
export async function loadJsonOrYaml(
  filepath: string,
  encoding = 'utf-8',
): Promise<unknown | never> {
  if (!isFileSync(filepath))
    throw new Error(`${filepath} is an invalid file path`)

  const loadContent = (): Promise<string> =>
    fs.readFile(filepath, encoding as BufferEncoding)

  let result: unknown
  const extname = path.extname(filepath)
  switch (extname) {
    case '.json':
      {
        const content: string = await loadContent()
        result = JSON.parse(content)
      }
      break
    case '.yml':
    case '.yaml':
      {
        const content: string = await loadContent()
        result = yaml.load(content, { filename: filepath, json: true })
      }
      break
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
 * @param logger
 */
export function loadJsonOrYamlSync(
  filepath: string,
  encoding = 'utf-8',
): unknown | never {
  if (!isFileSync(filepath))
    throw new Error(`${filepath} is an invalid file path`)

  const loadContent = (): string =>
    fs.readFileSync(filepath, encoding as BufferEncoding)

  let result: unknown
  const extname = path.extname(filepath)
  switch (extname) {
    case '.json':
      {
        const content: string = loadContent()
        result = JSON.parse(content)
      }
      break
    case '.yml':
    case '.yaml':
      {
        const content: string = loadContent()
        result = yaml.load(content, { filename: filepath, json: true })
      }
      break
    default:
      throw new Error(
        `Only files in .json / .yml / .ymal format are supported. filepath(${filepath}`,
      )
  }
  return result
}
