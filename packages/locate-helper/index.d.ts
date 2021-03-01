/**
 * Locate a nearest filepath from the given `currentDir` which name included
 * in the give `filenames`.
 */
export function locateNearestFilepath(
  currentDir: string,
  filenames: string | string[],
): string | null

/**
 * Find a nearest filepath from the give `currentDir`which matched the give
 * tester `testFilepath`.
 */
export function findNearestFilepath(
  currentDir: string,
  testFilepath: (filepath: string) => boolean,
): string | null
