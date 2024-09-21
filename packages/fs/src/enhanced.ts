import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import type { WriteFileOptions } from 'node:fs'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

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
    invariant(statSync(dirpath).isDirectory(), `[emptyDir] not a directory. (${dirpath})`)

    // Print verbose log.
    reporter?.verbose?.(`empty: ${dirpath}`)

    await rm(dirpath)
    await fs.mkdir(dirpath, { recursive: true })
  } else {
    if (createIfNotExist) await fs.mkdir(dirpath, { recursive: true })
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
  } else if (!existsSync(filepath!)) {
    errMsg = `Not found: ${filepath}.`
  } else if (!statSync(filepath).isFile()) {
    errMsg = `Not a file: ${filepath}.`
  }

  invariant(errMsg == null, errMsg)
}

/**
 * Create a path of directories.
 *
 * @param filepath  the give file path
 * @param isDir     Whether the given path is a directory
 * @param reporter
 */
export function mkdirsIfNotExists(filepath: string, isDir: boolean, reporter?: IReporter): void {
  const dirpath = isDir ? filepath : path.dirname(filepath)
  if (existsSync(dirpath)) return

  // Print verbose log.
  reporter?.verbose?.(`mkdirs: ${dirpath}`)

  mkdirSync(dirpath, { recursive: true })
}

/**
 * Remove filepath/dirpath recursively.
 * @param fileOrDirPath
 */
export async function rm(fileOrDirPath: string): Promise<void> {
  if (existsSync(fileOrDirPath)) {
    await fs.rm(fileOrDirPath, { recursive: true, force: true })
  }
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
  const dirpath = path.dirname(filepath)
  await fs.mkdir(dirpath, { recursive: true })
  await fs.writeFile(filepath, content, options)
}
