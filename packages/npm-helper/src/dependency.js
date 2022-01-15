const { locateLatestPackageJson } = require('@guanghechen/locate-helper')
const fs = require('fs-extra')

/**
 * default Dependency fields
 */
const createDependencyFields = () => ['dependencies', 'optionalDependencies', 'peerDependencies']

/**
 * Collect all dependencies declared in the package.json and the dependency's
 * dependencies and so on.
 *
 * @param {string|null} packageJsonPath
 * @param {ReadonlyArray<string>|undefined} dependencyFields (such as ['dependencies', 'devDependencies'])
 * @param {ReadonlyArray<string>|null|undefined} additionalDependencies
 * @param {((moduleName: string) => boolean)|null|undefined} isAbsentAllowed
 * @returns {string[]}
 */
function collectAllDependencies(
  packageJsonPath,
  dependencyFields = createDependencyFields(),
  additionalDependencies = null,
  isAbsentAllowed = null,
) {
  /** @type {string[]} */
  const result = []
  if (isAbsentAllowed == null) {
    const regex = /^@types\//
    // eslint-disable-next-line no-param-reassign
    isAbsentAllowed = moduleName => regex.test(moduleName)
  }

  /**
   * @param {string} dependency
   * @returns {void}
   */
  const followDependency = dependency => {
    if (result.includes(dependency)) return
    result.push(dependency)

    // recursively collect
    let nextPackageJsonPath = null
    try {
      const dependencyPath = require.resolve(dependency)
      nextPackageJsonPath = locateLatestPackageJson(dependencyPath)
    } catch (e) {
      switch (e.code) {
        case 'MODULE_NOT_FOUND':
          if (isAbsentAllowed(dependency)) return
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
  const collectDependencies = dependencyPackageJsonPath => {
    if (!fs.existsSync(dependencyPackageJsonPath)) {
      console.warn(`no such file or directory: ${dependencyPackageJsonPath}`)
      return
    }

    const manifest = fs.readJSONSync(dependencyPackageJsonPath)
    for (const fieldName of dependencyFields) {
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

module.exports = {
  createDependencyFields,
  collectAllDependencies,
}
