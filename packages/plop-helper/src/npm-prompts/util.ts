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
  return packageName.replace(/^(@[^\\/]+[\\/])/, '').replace(/[\\/]/g, '-')
}
