import { existsSync, readdirSync, statSync } from 'node:fs'

/**
 * Check whether if the dirpath is a directory path. (synchronizing)
 *
 * @param dirpath   directory path
 */
export function isDirectorySync(dirpath: string | null): boolean {
  if (dirpath == null) return false
  if (!existsSync(dirpath)) return false
  const stat = statSync(dirpath)
  return stat.isDirectory()
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

/**
 * Check whether if the dirPath is a non-existent path or empty folder.
 * (synchronizing)
 *
 * @param dirpath   directory path
 */
export function isNonExistentOrEmpty(dirpath: string | null): boolean {
  if (dirpath == null) return false
  if (!existsSync(dirpath)) return true
  const stat = statSync(dirpath)
  if (!stat.isDirectory()) return false
  const files: string[] = readdirSync(dirpath)
  return files.length <= 0
}
