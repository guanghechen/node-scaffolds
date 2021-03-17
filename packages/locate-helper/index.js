const fs = require('fs')
const path = require('path')

/**
 * Locate a nearest filepath from the given `currentDir` which name included
 * in the give `filenames`.
 *
 * @export
 * @param {string} currentDir
 * @param {string|string[]} filenames
 * @returns {string|null}
 */
function locateNearestFilepath(currentDir, filenames) {
  // Uniform paramter format.
  if (!Array.isArray(filenames)) {
    // eslint-disable-next-line no-param-reassign
    filenames = [filenames]
  }

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
 *
 * @export
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
  return findNearestFilepath(parentDir, testFilepath)
}

/**
 * Find the latest package.json under the give {currentDir} or its ancestor path.
 *
 * @param {string} currentDir
 * @returns {string|null}
 */
function locateLatestPackageJson(currentDir) {
  return locateNearestFilepath(currentDir, 'package.json')
}

module.exports = {
  locateLatestPackageJson,
  locateNearestFilepath,
  findNearestFilepath,
}
