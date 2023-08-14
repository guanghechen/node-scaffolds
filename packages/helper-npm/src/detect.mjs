import { readFileSync } from 'node:fs'
import { locateLatestPackageJson, locateNearestFilepath } from './locate.mjs'

/**
 * Detect whether if it is a monorepo under the cwd.
 *
 * @param {string} currentDir
 * @returns {boolean}
 */
export function detectMonorepo(currentDir) {
  // detect lerna
  if (locateNearestFilepath(currentDir, 'lerna.json') != null) return true

  // detect yarn workspace
  const manifestFilepath = locateLatestPackageJson(currentDir)
  if (manifestFilepath != null) {
    const content = readFileSync(manifestFilepath, 'utf8')
    const manifest = JSON.parse(content)
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
export function detectPackageAuthor(currentDir) {
  const manifestFilepath = locateLatestPackageJson(currentDir)
  if (manifestFilepath != null) {
    const content = readFileSync(manifestFilepath, 'utf8')
    const manifest = JSON.parse(content)
    if (manifest.author != null) {
      if (typeof manifest.author === 'string') return manifest.author
      if (typeof manifest.author.name === 'string') return manifest.author.name
    }
  }
  return null
}
