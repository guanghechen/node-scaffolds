import { locateNearestFilepath } from '@guanghechen/helper-path'
import fs from 'node:fs'

export type IDependencyField = 'dependencies' | 'optionalDependencies' | 'peerDependencies'

/**
 * Default Dependency fields
 */
export const getDefaultDependencyFields = (): IDependencyField[] => [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
]

/**
 * Collect all dependencies declared in the package.json and the dependency's dependencies and so on.
 *
 * @param packageJsonPath
 * @param dependenciesFields (such as ['dependencies', 'devDependencies'])
 * @param additionalDependencies
 * @param isAbsentAllowed
 * @returns
 */
export function collectAllDependencies(
  packageJsonPath: string | null,
  dependenciesFields: ReadonlyArray<IDependencyField> = getDefaultDependencyFields(),
  additionalDependencies: ReadonlyArray<string> | null = null,
  isAbsentAllowed: ((moduleName: string) => boolean) | null = null,
): string[] {
  const result: string[] = []
  if (isAbsentAllowed == null) {
    const regex = /^@types\//
    // eslint-disable-next-line no-param-reassign
    isAbsentAllowed = moduleName => regex.test(moduleName)
  }

  const followDependency = (dependency: string): void => {
    if (result.includes(dependency)) return
    result.push(dependency)

    // recursively collect
    let nextPackageJsonPath = null
    try {
      const dependencyPath = require.resolve(dependency)
      nextPackageJsonPath = locateLatestPackageJson(dependencyPath)
    } catch (e: any) {
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

    const content = fs.readFileSync(dependencyPackageJsonPath, 'utf8')
    const manifest = JSON.parse(content)
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

  return result.sort()
}

/**
 * Find the latest package.json under the give {currentDir} or its ancestor path.
 *
 * @param currentDir
 * @returns
 */
export function locateLatestPackageJson(currentDir: string): string | null {
  return locateNearestFilepath(currentDir, 'package.json')
}
