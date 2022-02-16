import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import type { IConfigTarget, ICopyTargetItem } from '../types'
import { isFile, renameTarget } from './common'

export * from './common'
export * from './copy'
export * from './logger'
export * from './option'

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

  const { base, dir } = path.parse(srcPath)
  const destinationFolder =
    flatten || (!flatten && !dir) ? dest : dir.replace(dir.split('/')[0], dest)

  const destFilePath = path.join(destinationFolder, renameTarget(base, rename, srcPath))
  const result: ICopyTargetItem = {
    srcPath,
    destPath: destFilePath,
    renamed: !!rename,
    transformed: false,
    target,
  }

  if (transform) {
    const contents = await fs.readFile(srcPath)
    result.contents = await transform(contents, srcPath, destFilePath)
    result.transformed = true
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
