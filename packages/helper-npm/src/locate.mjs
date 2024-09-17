import { existsSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Locate a nearest filepath from the given `currentDir` which name included in the `filenames`.
 *
 * @param {string} currentDir
 * @param {string|ReadonlyArray<string>} filenames
 * @returns {string|null}
 */
export function locateNearestFilepath(currentDir, filenames) {
  return internalRecursiveLocate(
    currentDir.startsWith('file://') ? fileURLToPath(currentDir) : currentDir,
    [filenames].flat(),
  )
}

/**
 * Find the latest package.json under the give {currentDir} or its ancestor path.
 *
 * @param {string} currentDir
 * @returns {string|null}
 */
export function locateLatestPackageJson(currentDir) {
  return locateNearestFilepath(currentDir, 'package.json')
}

/**
 *
 * @param {string} currentDir
 * @param {ReadonlyArray<string>} filenames
 * @returns {string|null}
 */
function internalRecursiveLocate(currentDir, filenames) {
  for (const filename of filenames) {
    const filepath = join(currentDir, filename)
    if (existsSync(filepath)) return filepath
  }

  const parentDir = dirname(currentDir)
  if (parentDir === currentDir || !isAbsolute(parentDir)) return null

  // Recursively locate.
  return locateNearestFilepath(parentDir, filenames)
}
