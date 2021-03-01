const fs = require('fs')
const path = require('path')

/**
 * Locate a nearest filepath from the given `currentDir` which name included
 * in the give `filenames`.
 * @param {string} currentDir
 * @param {string[]} filenames
 * @returns {string|null}
 */
function locateNearestFilepath(currentDir, filenames) {
  for (const filename of filenames) {
    const filepath = path.join(currentDir, filename)
    if (fs.existsSync(filepath)) return filepath
  }

  const parentDir = path.dirname(currentDir)
  if (parentDir === currentDir) return null

  // Recursively locate.
  return locateNearestFilepath(parentDir, filenames)
}

/**
 * Find a nearest filepath from the give `currentDir`which matched the give
 * tester `testFilepath`.
 * @param {string} currentDir
 * @param {(filepath: string) => boolean} testFilepath
 * @returns {string|null}
 */
function findNearestFilepath(currentDir, testFilepath) {
  const filenames = fs.readdirSync(currentDir)
  for (const filename of filenames) {
    const filepath = path.join(currentDir, filename)
    if (testFilepath(filepath)) return filepath
  }

  const parentDir = path.dirname(currentDir)
  if (parentDir === currentDir) return null

  // Recursively locate.
  return findNearestFilepath(parentDir, filenames)
}

module.exports = {
  locateNearestFilepath,
  findNearestFilepath,
}
