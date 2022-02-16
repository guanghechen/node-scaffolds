import fs from 'fs-extra'
import type { GlobbyOptions } from 'globby'
import globby from 'globby'
import path from 'path'
import type { IConfigRename, IConfigTarget, IConfigTransform, ICopyTargetItem } from '../types'
import { isFile } from './common'

export * from './common'
export * from './option'

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
 * @param src
 * @param dest
 * @param options
 */
export async function generateCopyTarget(
  src: string,
  dest: string,
  options: {
    flatten: boolean
    rename?: IConfigRename
    transform?: IConfigTransform
  },
): Promise<ICopyTargetItem> {
  const { flatten, rename, transform } = options
  if (transform != null && !(await isFile(src))) {
    throw new Error(`"transform" option works only on files: '${src}' must be a file`)
  }

  const { base, dir } = path.parse(src)
  const destinationFolder =
    flatten || (!flatten && !dir) ? dest : dir.replace(dir.split('/')[0], dest)

  const destFilePath = path.join(destinationFolder, renameTarget(base, rename, src))
  const result: ICopyTargetItem = {
    src,
    dest: destFilePath,
    renamed: Boolean(rename),
    transformed: false,
  }

  if (transform) {
    const contents = await fs.readFile(src)
    result.contents = await transform(contents, src, destFilePath)
    result.transformed = true
  }
  return result
}

/**
 * Collect copyTargets
 */
export async function collectAndWatchingTargets(
  targets: ReadonlyArray<IConfigTarget>,
  flatten: boolean,
  defaultGlobbyOptions: GlobbyOptions,
): Promise<ICopyTargetItem[]> {
  const copyTargets: ICopyTargetItem[] = []
  for (const target of targets) {
    const { dest, rename, src, transform, globbyOptions } = target

    const matchedPaths: string[] = await globby(src, {
      expandDirectories: false,
      onlyFiles: false,
      ...defaultGlobbyOptions,
      ...globbyOptions,
    })

    if (matchedPaths.length) {
      const options = { flatten, rename, transform }
      for (const matchedPath of matchedPaths) {
        const destinations: string[] = dest
        for (const destination of destinations) {
          const copyTarget: ICopyTargetItem = await generateCopyTarget(
            matchedPath,
            destination,
            options,
          )
          copyTargets.push(copyTarget)
        }
      }
    }
  }
  return copyTargets
}
