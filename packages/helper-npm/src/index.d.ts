export type IDependencyField = 'dependencies' | 'optionalDependencies' | 'peerDependencies'

/**
 * Default Dependency fields
 * @returns {IDependencyField[]}
 */
export function getDefaultDependencyFields(): IDependencyField[]

/**
 * Collect all dependencies declared in the package.json and the dependency's dependencies and so on.
 *
 * @param {string|null} packageJsonPath
 * @param {ReadonlyArray<IDependencyField>|undefined} dependenciesFields (such as ['dependencies', 'devDependencies'])
 * @param {ReadonlyArray<string>|null|undefined} additionalDependencies
 * @param {((moduleName: string) => boolean)|null|undefined} isAbsentAllowed
 * @returns {Promise<string[]>}
 */
export function collectAllDependencies(
  packageJsonPath: string | null,
  dependenciesFields?: ReadonlyArray<IDependencyField>,
  additionalDependencies?: ReadonlyArray<string> | null,
  isAbsentAllowed?: ((moduleName: string) => boolean) | null,
): Promise<string[]>

/**
 * Detect whether if it is a monorepo under the cwd.
 *
 * @param {string} currentDir
 * @returns {boolean}
 */
export function detectMonorepo(currentDir: string): boolean

/**
 * Detect default package author.
 *
 * @param {string} currentDir
 * @returns {string|null}
 */
export function detectPackageAuthor(currentDir: string): string | null

/**
 * Locate a nearest filepath from the given `currentDir` which name included in the give `filenames`.
 *
 * @param {string} currentDir
 * @param {string|ReadonlyArray<string>} filenames
 * @returns {string|null}
 */
export function locateNearestFilepath(
  currentDir: string,
  filenames: string | ReadonlyArray<string>,
): string | null

/**
 * Find the latest package.json under the give {currentDir} or its ancestor path.
 *
 * @param {string} currentDir
 * @returns {string|null}
 */
export function locateLatestPackageJson(currentDir: string): string | null
