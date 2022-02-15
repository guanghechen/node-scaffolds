import fs from 'fs-extra'
import type { GlobbyOptions } from 'globby'
import globby from 'globby'
import { isPlainObject } from 'is-plain-object'
import path from 'path'
import util from 'util'
import type { RollupPluginCopyTargetItem, RollupPluginCopyTargetOption } from './types'

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
  rename: string | ((name: string, ext: string, srcPath: string) => string) | undefined,
  srcPath: string,
): string {
  const parsedPath = path.parse(targetFilePath)
  if (rename == null) return targetFilePath
  if (typeof rename === 'string') return rename
  return rename(parsedPath.name, parsedPath.ext.replace(/^(\.)?/, ''), srcPath)
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
    rename?: RollupPluginCopyTargetOption['rename']
    transform?: RollupPluginCopyTargetOption['transform']
  },
): Promise<RollupPluginCopyTargetItem> {
  const { flatten, rename, transform } = options
  if (transform != null && !(await isFile(src))) {
    throw new Error(`"transform" option works only on files: '${src}' must be a file`)
  }

  const { base, dir } = path.parse(src)
  const destinationFolder =
    flatten || (!flatten && !dir) ? dest : dir.replace(dir.split('/')[0], dest)

  const destFilePath = path.join(destinationFolder, renameTarget(base, rename, src))
  const result: RollupPluginCopyTargetItem = {
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
  targets: ReadonlyArray<RollupPluginCopyTargetOption>,
  flatten: boolean,
  additionalGlobbyOptions: Partial<GlobbyOptions> & {
    encoding?: string | null | undefined
    flag?: string | undefined
    mode?: number | undefined
  },
): Promise<RollupPluginCopyTargetItem[]> {
  const copyTargets: RollupPluginCopyTargetItem[] = []
  if (Array.isArray(targets) && targets.length) {
    for (const target of targets) {
      if (!isPlainObject(target)) {
        throw new Error(`${stringify(target)} target must be an object`)
      }

      const { dest, rename, src, transform, ...restTargetOptions } = target

      if (!src || !dest) {
        throw new Error(`${stringify(target)} target must have "src" and "dest" properties`)
      }

      if (rename && typeof rename !== 'string' && typeof rename !== 'function') {
        throw new Error(
          `${stringify(target)} target's "rename" property must be a string or a function`,
        )
      }

      const matchedPaths: string[] = await globby(src, {
        expandDirectories: false,
        onlyFiles: false,
        ...additionalGlobbyOptions,
        ...restTargetOptions,
      } as GlobbyOptions)

      if (matchedPaths.length) {
        const options = { flatten, rename, transform }
        for (const matchedPath of matchedPaths) {
          const destinations = Array.isArray(dest) ? dest : [dest]
          for (const destination of destinations) {
            const copyTarget: RollupPluginCopyTargetItem = await generateCopyTarget(
              matchedPath,
              destination,
              options,
            )
            copyTargets.push(copyTarget)
          }
        }
      }
    }
  }
  return copyTargets
}
