import type { IReporter } from '@guanghechen/reporter.types'
import type { WriteFileOptions } from 'node:fs'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { mkdir as fsMkdir, rm as fsRm, writeFile as fsWriteFile } from 'node:fs/promises'
import { dirname as pathDirname } from 'node:path'

/**
 * Remove file/folder recursively.
 * @param fileOrDirPath
 */
export async function rm(fileOrDirPath: string): Promise<void> {
  if (existsSync(fileOrDirPath)) {
    await fsRm(fileOrDirPath, { recursive: true, force: true })
  }
}

/**
 * Remove all files under the given directory path.
 * @param dirpath
 * @param createIfNotExist
 * @param reporter
 */
export async function emptyDir(
  dirpath: string,
  createIfNotExist = true,
  reporter?: IReporter,
): Promise<void> {
  if (existsSync(dirpath)) {
    if (!statSync(dirpath).isDirectory()) {
      reporter?.warn('[emptyDir] not a directory. dirpath: {}', dirpath)
      return
    }

    // Print verbose log.
    reporter?.verbose?.('[emptyDir] emptying: {}', dirpath)

    await rm(dirpath)
    await fsMkdir(dirpath, { recursive: true })
  } else {
    if (createIfNotExist) await fsMkdir(dirpath, { recursive: true })
  }
}

/**
 * Ensure critical filepath exists.
 *
 * @param filepath
 */
export function ensureCriticalFilepathExistsSync(filepath: string | null): void | never {
  let errMsg: string | null = null

  if (filepath == null) {
    errMsg = `Invalid path: ${filepath}.`
  } else if (!existsSync(filepath)) {
    errMsg = `Not found: ${filepath}.`
  } else if (!statSync(filepath).isFile()) {
    errMsg = `Not a file: ${filepath}.`
  }

  if (errMsg !== null) throw new Error(errMsg)
}

/**
 * Create a path of directories.
 *
 * @param filepath  the give file path
 * @param isDir     Whether the given path is a directory
 * @param reporter
 */
export function mkdirsIfNotExists(filepath: string, isDir: boolean, reporter?: IReporter): void {
  const dirpath = isDir ? filepath : pathDirname(filepath)
  if (existsSync(dirpath)) return

  // Print verbose log.
  reporter?.verbose?.(`mkdirs: ${dirpath}`)

  mkdirSync(dirpath, { recursive: true })
}

/**
 * If the path is not existed, created before write.
 *
 * @param filepath
 * @param content
 * @param options
 */
export async function writeFile(
  filepath: string,
  content: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
): Promise<void> {
  const dirpath = pathDirname(filepath)
  await fsMkdir(dirpath, { recursive: true })
  await fsWriteFile(filepath, content, options)
}
/**
 * Check whether if the filepath is a file path. (synchronizing)
 *
 * @param filepath   file path
 */
export function isFileSync(filepath: string | null): boolean {
  if (filepath == null) return false
  if (!existsSync(filepath)) return false
  const stat = statSync(filepath)
  return stat.isFile()
}
