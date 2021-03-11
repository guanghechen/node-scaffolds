import { locateNearestFilepath } from '@guanghechen/locate-helper'
import fs from 'fs-extra'

export const dependencyKeys: () => ReadonlyArray<
  'dependencies' | 'optionalDependencies' | 'peerDependencies'
> = () => ['dependencies', 'optionalDependencies', 'peerDependencies']

/**
 * Collect all dependencies declared in the package.json and the dependency's
 * dependencies and so on.
 *
 * @param packageJsonPath
 * @param dependenciesFields
 * @param additionalDependencies
 * @param isAbsentAllowed
 */
export function collectAllDependencies(
  packageJsonPath: string | null,
  dependenciesFields: ReadonlyArray<string>,
  additionalDependencies: ReadonlyArray<string> | null = null,
  isAbsentAllowed: ((moduleName: string) => boolean) | null = null,
): string[] {
  const result: string[] = []
  if (isAbsentAllowed == null) {
    const regex = /^@types\//
    // eslint-disable-next-line no-param-reassign
    isAbsentAllowed = moduleName => regex.test(moduleName)
  }

  /**
   * @param {string} dependency
   * @returns {void}
   */
  const followDependency = (dependency: string): void => {
    if (result.includes(dependency)) return
    result.push(dependency)

    // recursively collect
    let nextPackageJsonPath = null
    try {
      const dependencyPath = require.resolve(dependency)
      nextPackageJsonPath = locateNearestFilepath(
        dependencyPath,
        'package.json',
      )
    } catch (e) {
      switch (e.code) {
        case 'MODULE_NOT_FOUND':
          if (isAbsentAllowed!(dependency)) return
          break
        case 'ERR_PACKAGE_PATH_NOT_EXPORTED':
          return
        default:
          console.error(e)
          return
      }
    }

    if (nextPackageJsonPath == null) {
      console.warn(`cannot find package.json for '${dependency}'`)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    collectDependencies(nextPackageJsonPath)
  }

  /**
   * @param {string} dependencyPackageJsonPath
   * @returns {void}
   */
  const collectDependencies = (dependencyPackageJsonPath: string): void => {
    if (!fs.existsSync(dependencyPackageJsonPath)) {
      console.warn(`no such file or directory: ${dependencyPackageJsonPath}`)
      return
    }

    const manifest = fs.readJSONSync(dependencyPackageJsonPath)
    for (const fieldName of dependenciesFields) {
      const field = manifest[fieldName]
      if (field != null) {
        for (const dependency of Object.keys(field)) {
          followDependency(dependency)
        }
      }
    }
  }

  // collect from package.json
  if (packageJsonPath != null) {
    collectDependencies(packageJsonPath)
  }

  // collect from dependencies
  if (additionalDependencies != null) {
    for (const dependency of additionalDependencies) {
      followDependency(dependency)
    }
  }

  return result
}

export default collectAllDependencies
