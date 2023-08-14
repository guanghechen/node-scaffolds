import { existsSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Locate a nearest filepath from the given `currentDir` which name included in the give `filenames`.
 *
 * @param currentDir
 * @param filenames
 * @returns
 */
export function locateNearestFilepath(
  currentDir: string,
  filenames: string | ReadonlyArray<string>,
): string | null {
  return internalRecursiveLocate(
    currentDir.startsWith('file://') ? fileURLToPath(currentDir) : currentDir,
    [filenames].flat(),
  )
}

/**
 * Find a nearest filepath from the give `currentDir`which matched the give tester `testFilepath`.
 *
 * @param currentDir
 * @param predicate
 * @returns
 */
export function findNearestFilepath(
  currentDir: string,
  predicate: (filepath: string) => boolean,
): string | null {
  return internalFindNearestFilepath(
    currentDir.startsWith('file://') ? fileURLToPath(currentDir) : currentDir,
    predicate,
  )
}

function internalRecursiveLocate(
  currentDir: string,
  filenames: ReadonlyArray<string>,
): string | null {
  for (const filename of filenames) {
    const filepath = join(currentDir, filename)
    if (existsSync(filepath)) return filepath
  }

  const parentDir = dirname(currentDir)
  if (parentDir === currentDir || !isAbsolute(parentDir)) return null

  // Recursively locate.
  return locateNearestFilepath(parentDir, filenames)
}

function internalFindNearestFilepath(
  currentDir: string,
  predicate: (filepath: string) => boolean,
): string | null {
  const filenames = readdirSync(currentDir)
  for (const filename of filenames) {
    const filepath = join(currentDir, filename)
    if (predicate(filepath)) return filepath
  }

  const parentDir = dirname(currentDir)
  if (parentDir === currentDir) return null

  // Recursively locate.
  return internalFindNearestFilepath(parentDir, predicate)
}
