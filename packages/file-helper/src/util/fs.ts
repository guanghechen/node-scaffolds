import type { ChalkLogger } from '@guanghechen/chalk-logger'
import invariant from '@guanghechen/invariant'
import fs from 'fs-extra'
import path from 'path'

/**
 * Create a path of directories.
 *
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

  // Print verbose log.
  if (logger != null && logger.verbose != null) {
    logger.verbose(`mkdirs: ${dirPath}`)
  }

  fs.mkdirsSync(dirPath)
}

/**
 * Ensure critical filepath exists.
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
 * Collect all files under the given directory.
 *
 * @param dir
 * @param predicate
 */
export async function collectAllFiles(
  dir: string,
  predicate?:
    | ((p: string, stat: fs.Stats) => Promise<boolean> | boolean)
    | null,
): Promise<string[]> {
  const results: string[] = []
  await collect(dir)
  return results

  async function collect(filepath: string): Promise<void> {
    const stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      const filenames = fs.readdirSync(filepath)
      for (const filename of filenames) {
        const nextFilepath = path.join(filepath, filename)
        await collect(nextFilepath)
      }
      return
    }

    if (stat.isFile()) {
      if (predicate == null || (await predicate(filepath, stat))) {
        results.push(filepath)
      }
    }
  }
}

/**
 * Collect all files under the given directory.   (synchronizing)
 *
 * @param dir
 * @param predicate
 */
export function collectAllFilesSync(
  dir: string,
  predicate?: ((p: string, stat: fs.Stats) => boolean) | null,
): string[] {
  const results: string[] = []
  collect(dir)
  return results

  function collect(filepath: string): void {
    const stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      const filenames = fs.readdirSync(filepath)
      for (const filename of filenames) {
        const nextFilepath = path.join(filepath, filename)
        collect(nextFilepath)
      }
      return
    }
    if (stat.isFile()) {
      if (predicate == null || predicate(filepath, stat)) {
        results.push(filepath)
      }
    }
  }
}
