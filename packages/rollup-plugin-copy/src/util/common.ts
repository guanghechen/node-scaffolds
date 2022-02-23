import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import util from 'util'
import type { IConfigRename, IConfigTarget, ICopyTargetItem } from '../types'

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

/**
 * Generate copy target item
 *
 * @param srcPattern
 * @param srcPath
 * @param dest
 * @param options
 */
export async function generateCopyTarget(
  srcPath: string,
  dest: string,
  target: Readonly<IConfigTarget>,
): Promise<ICopyTargetItem> {
  const { flatten, rename, transform } = target
  if (transform != null && !(await isFile(srcPath))) {
    throw new Error(`"transform" option works only on files: '${srcPath}' must be a file`)
  }

  const { base: oldFileName, dir } = path.parse(srcPath)
  const destinationFolder = flatten || (!flatten && !dir) ? dest : dir.replace(/^([^/\\]+)/, dest)
  const newFileName: string = renameTarget(oldFileName, rename, srcPath)
  const destFilePath = path.join(destinationFolder, newFileName)
  const result: ICopyTargetItem = {
    srcPath,
    destPath: destFilePath,
    renamed: oldFileName !== newFileName,
    copying: false,
    queueingTimestamp: 0,
    target,
  }
  return result
}

/**
 * Collect copyTargets
 */
export async function collectAndWatchingTargets(
  targets: ReadonlyArray<IConfigTarget>,
): Promise<ICopyTargetItem[]> {
  const copyTargets: ICopyTargetItem[] = []
  for (const target of targets) {
    const { dest, src, globbyOptions } = target

    const matchedPaths: string[] = await globby(src, {
      expandDirectories: false,
      onlyFiles: false,
      ...globbyOptions,
    })

    if (matchedPaths.length) {
      for (const matchedPath of matchedPaths) {
        const destinations: string[] = dest
        for (const destination of destinations) {
          const copyTarget: ICopyTargetItem = await generateCopyTarget(
            matchedPath,
            destination,
            target,
          )
          copyTargets.push(copyTarget)
        }
      }
    }
  }
  return copyTargets
}
