import type { ChalkLogger } from '@guanghechen/chalk-logger'
import invariant from '@guanghechen/invariant'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'

/**
 * Check whether if the filepath is a file path.
 *
 * @param filepath   file path
 */
export async function isFile(filepath: string | null): Promise<boolean> {
  if (filepath == null) return false
  if (!fs.existsSync(filepath)) return false
  const stat = await fs.stat(filepath)
  return stat.isFile()
}

/**
 * Check whether if the filepath is a file path. (synchronizing)
 *
 * @param filepath   file path
 */
export function isFileSync(filepath: string | null): boolean {
  if (filepath == null) return false
  if (!fs.existsSync(filepath)) return false
  const stat = fs.statSync(filepath)
  return stat.isFile()
}

/**
 * Check whether if the dirpath is a directory path. (synchronizing)
 *
 * @param dirpath   directory path
 */
export function isDirectorySync(dirpath: string | null): boolean {
  if (dirpath == null) return false
  if (!fs.existsSync(dirpath)) return false
  const stat = fs.statSync(dirpath)
  return stat.isDirectory()
}

/**
 * Check whether if the dirPath is a non-existent path or empty folder.
 * (synchronizing)
 *
 * @param dirpath   directory path
 */
export function isNonExistentOrEmpty(dirpath: string | null): boolean {
  if (dirpath == null) return false
  if (!fs.existsSync(dirpath)) return true
  const stat = fs.statSync(dirpath)
  if (!stat.isDirectory()) return false
  const files: string[] = fs.readdirSync(dirpath)
  return files.length <= 0
}

/**
 * If the give file path does not exist, then create it.
 * @param filepath  the give file path
 * @param isDir     Whether the given path is a directory
 */
export function mkdirsIfNotExists(
  filepath: string,
  isDir: boolean,
  logger?: ChalkLogger,
): void {
  const dirPath = isDir ? filepath : path.dirname(filepath)
  if (fs.existsSync(dirPath)) return

  if (logger != null && logger.verbose != null) {
    logger.verbose(`mkdirs: ${dirPath}`)
  }
  fs.mkdirsSync(dirPath)
}

/**
 * Ensure critical filepath exists, otherwise, kill the process (synchronizing)
 *
 * @param filepath
 */
export function ensureCriticalFilepathExistsSync(
  filepath: string | null,
): void | never {
  let errMsg: string | null = null

  if (filepath == null) {
    errMsg = `Invalid path: ${filepath}.`
  } else if (!fs.existsSync(filepath!)) {
    errMsg = `Not found: ${filepath}.`
  } else if (!fs.statSync(filepath).isFile()) {
    errMsg = `Not a file: ${filepath}.`
  }

  invariant(errMsg == null, errMsg)
}

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
  if (!(await isFile(filepath)))
    throw new Error(`${filepath} is an invalid file path`)

  const loadContent = async (): Promise<string> =>
    fs.readFileSync(filepath, encoding as BufferEncoding)

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

/**
 * Collect all files under the directory
 *
 * @param dir
 * @param predicate
 */
export function collectAllFilesSync(
  dir: string,
  predicate: ((p: string) => boolean) | null,
): string[] {
  const stat = fs.statSync(dir)
  const results: string[] = []
  if (stat.isDirectory()) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const absFile = path.join(dir, file)
      results.push(...collectAllFilesSync(absFile, predicate))
    }
  } else if (stat.isFile()) {
    if (predicate == null || predicate(dir)) {
      results.push(dir)
    }
  }
  return results
}
