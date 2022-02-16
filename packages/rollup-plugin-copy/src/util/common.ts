import fs from 'fs-extra'
import path from 'path'
import util from 'util'
import type { IConfigRename } from '../types'

export { isPlainObject } from 'is-plain-object'

/**
 * Stringify data
 * @param value
 */
export function stringify(value: unknown): string {
  return util.inspect(value, { breakLength: Infinity })
}

/**
 * Determine if it is a file
 * @param filePath
 */
export async function isFile(filePath: string): Promise<boolean> {
  const fileStats = await fs.stat(filePath)
  return fileStats.isFile()
}

/**
 * Calc new name of target filepath
 * @param targetFilePath
 * @param rename
 */
export function renameTarget(
  targetFilePath: string,
  rename: IConfigRename | undefined,
  srcPath: string,
): string {
  const parsedPath = path.parse(targetFilePath)
  return rename
    ? rename(parsedPath.name, parsedPath.ext.replace(/^(\.)?/, ''), srcPath)
    : targetFilePath
}
