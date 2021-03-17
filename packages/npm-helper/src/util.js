const {
  locateLatestPackageJson,
  locateNearestFilepath,
} = require('@guanghechen/locate-helper')
const fs = require('fs-extra')

/**
 * Detect whether if it is a monorepo under the cwd.
 *
 * @param {string} currentDir
 * @returns {boolean}
 */
function detectMonorepo(currentDir) {
  // detect lerna
  if (locateNearestFilepath(currentDir, 'lerna.json') != null) return true

  // detect yarn workspace
  const manifestFilepath = locateLatestPackageJson(currentDir)
  if (manifestFilepath != null) {
    const manifest = fs.readJSONSync(manifestFilepath)
    if (Array.isArray(manifest.workspaces) && manifest.workspaces.length > 0) {
      return true
    }
  }

  // Neither lerna nor yarn workspace detected.
  return false
}

/**
 * Detect default package author.
 *
 * @param {string} currentDir
 * @returns {string|null}
 */
function detectPackageAuthor(currentDir) {
  const manifestFilepath = locateLatestPackageJson(currentDir)
  if (manifestFilepath != null) {
    const manifest = fs.readJSONSync(manifestFilepath)
    if (manifest.author != null) {
      if (typeof manifest.author === 'string') return manifest.author
      if (typeof manifest.author.name === 'string') return manifest.author.name
    }
  }
  return null
}

module.exports = {
  detectMonorepo,
  detectPackageAuthor,
}
