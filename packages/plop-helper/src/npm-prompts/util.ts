import { locateNearestFilepath } from '@guanghechen/locate-helper'
import { isNotEmptyArray, isString } from '@guanghechen/option-helper'
import fs from 'fs-extra'

/**
 * Detect whether if it is a monorepo under the cwd.
 *
 * @param cwd
 * @returns
 */
export function detectMonorepo(cwd: string): boolean {
  // detect lerna
  if (locateNearestFilepath(cwd, 'lerna.json') != null) return true

  // detect yarn workspace
  const manifestFilepath = locateNearestFilepath(cwd, 'package.json')
  if (manifestFilepath != null) {
    const manifest = fs.readJSONSync(manifestFilepath)
    if (isNotEmptyArray(manifest.workspace)) return true
  }

  // Neither lerna nor yarn workspace detected.
  return false
}

/**
 * Detect default package author.
 *
 * @param cwd
 * @returns
 */
export function detectPackageAuthor(cwd: string): string | undefined {
  const manifestFilepath = locateNearestFilepath(cwd, 'package.json')
  if (manifestFilepath != null) {
    const manifest = fs.readJSONSync(manifestFilepath)
    if (isString(manifest.author)) return manifest.author
    if (typeof manifest.author.name === 'string') return manifest.author.name
  }
  return void 0
}

/**
 * Resolve repositoryName.
 *
 * @param isMonorepo
 * @param packageName
 * @returns
 */
export function resolveRepositoryName(
  isMonorepo: boolean,
  packageName: string,
): string {
  if (isMonorepo) {
    const repositoryName: string = packageName.startsWith('@')
      ? /^@([^\\/]+)/.exec(packageName)![1]
      : /^([^-]+)/.exec(packageName)![1]
    return repositoryName
  }
  return packageName.replace(/^@/, '').replace('\\/', '-')
}
