import { resolve } from 'import-meta-resolve'
import { existsSync, readFileSync } from 'node:fs'
import url from 'node:url'
import { locateNearestFilepath } from './locate.mjs'

/**
 * Represents a field name within a package.json file that specifies different types of dependencies.
 * @typedef {'dependencies' | 'optionalDependencies' | 'peerDependencies'} IDependencyField
 */

/**
 * Default Dependency fields
 * @returns {IDependencyField[]}
 */
export function getDefaultDependencyFields() {
  return ['dependencies', 'optionalDependencies', 'peerDependencies']
}

/**
 * Collect all dependencies declared in the package.json and the dependency's dependencies and so on.
 *
 * @param {string|null} packageJsonPath
 * @param {ReadonlyArray<IDependencyField>|undefined} dependenciesFields (such as ['dependencies', 'devDependencies'])
 * @param {ReadonlyArray<string>|null|undefined} additionalDependencies
 * @param {((moduleName: string) => boolean)|null|undefined} isAbsentAllowed
 * @returns {Promise<string[]>}
 */
export async function collectAllDependencies(
  packageJsonPath,
  dependenciesFields = getDefaultDependencyFields(),
  additionalDependencies = null,
  isAbsentAllowed = null,
) {
  /** @type {Set<string>} */
  const dependencySet = new Set()

  if (isAbsentAllowed == null) {
    const regex = /^@types\//
    // eslint-disable-next-line no-param-reassign
    isAbsentAllowed = moduleName => regex.test(moduleName)
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

  /**
   * Follow the dependency to find and collect more dependencies.
   * @param {string} dependency
   * @returns {Promise<void>}
   */
  async function followDependency(dependency) {
    if (dependencySet.has(dependency)) return
    dependencySet.add(dependency)

    // recursively collect
    let nextPackageJsonPath = null
    try {
      /** @type {string} */
      const dependencyUrl = resolve(dependency, import.meta.url)
      /** @type {string} */
      const dependencyPath = url.fileURLToPath(dependencyUrl)
      nextPackageJsonPath = locateNearestFilepath(dependencyPath, 'package.json')
    } catch (e) {
      /* c8 ignore start */
      switch (e.code) {
        case 'ERR_MODULE_NOT_FOUND':
          if (isAbsentAllowed(dependency)) return
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
   * Collect dependencies.
   * @param {string} dependencyPackageJsonPath
   * @returns {Promise<void>}
   */
  async function collectDependencies(dependencyPackageJsonPath) {
    if (!existsSync(dependencyPackageJsonPath)) {
      console.warn(`no such file or directory: ${dependencyPackageJsonPath}`)
      return
    }

    const content = readFileSync(dependencyPackageJsonPath, 'utf8')
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
}
