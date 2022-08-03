import { locateLatestPackageJson, locateNearestFilepath } from '@guanghechen/locate-helper'
import fs from 'fs-extra'

/**
 * Detect whether if it is a monorepo under the cwd.
 *
 * @param currentDir
 * @returns
 */
export function detectMonorepo(currentDir: string): boolean {
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
 * @param currentDir
 * @returns
 */
export function detectPackageAuthor(currentDir: string): string | null {
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
