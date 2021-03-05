import fs from 'fs-extra'
import path from 'path'
import util from 'util'
import type {
  RollupPluginCopyTargetItem,
  RollupPluginCopyTargetOption,
} from './types'

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
  rename:
    | string
    | ((name: string, ext: string, srcPath: string) => string)
    | undefined,
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
    throw new Error(
      `"transform" option works only on files: '${src}' must be a file`,
    )
  }

  const { base, dir } = path.parse(src)
  const destinationFolder =
    flatten || (!flatten && !dir) ? dest : dir.replace(dir.split('/')[0], dest)

  const destFilePath = path.join(
    destinationFolder,
    renameTarget(base, rename, src),
  )
  const result: RollupPluginCopyTargetItem = {
    src,
    dest: destFilePath,
    renamed: Boolean(rename),
    transformed: false,
  }

  if (transform) {
    result.contents = await transform(await fs.readFile(src), src, destFilePath)
    result.transformed = true
  }
  return result
}
