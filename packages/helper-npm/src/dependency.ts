import { locateNearestFilepath } from '@guanghechen/helper-path'
import { resolve } from 'import-meta-resolve'
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
export async function collectAllDependencies(
  packageJsonPath: string | null,
  dependenciesFields: ReadonlyArray<IDependencyField> = getDefaultDependencyFields(),
  additionalDependencies: ReadonlyArray<string> | null = null,
  isAbsentAllowed: ((moduleName: string) => boolean) | null = null,
): Promise<string[]> {
  const dependencySet: Set<string> = new Set()

  if (isAbsentAllowed == null) {
    const regex = /^@types\//
    // eslint-disable-next-line no-param-reassign
    isAbsentAllowed = moduleName => regex.test(moduleName)
  }

  const followDependency = async (dependency: string): Promise<void> => {
    if (dependencySet.has(dependency)) return
    dependencySet.add(dependency)

    // recursively collect
    let nextPackageJsonPath = null
    try {
      const dependencyPath = await resolve(dependency, import.meta.url)
      if (dependencyPath != null) {
        nextPackageJsonPath = locateNearestFilepath(dependencyPath, 'package.json')
      }
    } catch (e: any) {
      /* c8 ignore start */
      switch (e.code) {
        case 'ERR_MODULE_NOT_FOUND':
          if (isAbsentAllowed!(dependency)) return
          break
        case 'ERR_PACKAGE_PATH_NOT_EXPORTED':
          return
        default:
          console.error(e)
          return
      }
      /* c8 ignore end */
    }

    if (nextPackageJsonPath == null) {
      console.warn(`cannot find package.json for '${dependency}'`)
      return
    }

    await collectDependencies(nextPackageJsonPath)
  }

  /**
   * @param {string} dependencyPackageJsonPath
   * @returns {void}
   */
  const collectDependencies = async (dependencyPackageJsonPath: string): Promise<void> => {
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
          await followDependency(dependency)
        }
      }
    }
  }

  // collect from package.json
  if (packageJsonPath != null) {
    await collectDependencies(packageJsonPath)
  }

  // collect from dependencies
  if (additionalDependencies != null) {
    for (const dependency of additionalDependencies) {
      await followDependency(dependency)
    }
  }

  return Array.from(dependencySet).sort()
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
