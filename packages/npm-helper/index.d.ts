/**
 * Detect whether if it is a monorepo under the {currentDir}.
 */
export function detectMonorepo(currentDir: string): boolean

/**
 * Detect default package author.
 */
export function detectPackageAuthor(currentDir: string): string | null

/**
 * Default dependency fields.
 */
export function createDependencyFields(): ReadonlyArray<
  |'dependencies'
  |'optionalDependencies'
  |'peerDependencies'
>

/**
 * Collect all dependencies declared in the package.json and the dependency's
 * dependencies and so on.
 *
 * @param packageJsonPath
 * @param dependenciesFields      (such as ['dependencies', 'devDependencies'])
 * @param additionalDependencies  Additional dependency names
 * @param isAbsentAllowed         Determine whether if a given moduleName can miss.
 *                                (called on `MODULE_NOT_FOUND` error thrown)
 */
export function collectAllDependencies(
  packageJsonPath: string | null,
  dependenciesFields?: ReadonlyArray<string>,
  additionalDependencies?: ReadonlyArray<string> | null,
  isAbsentAllowed?: ((moduleName: string) => boolean) | null,
): string[]
