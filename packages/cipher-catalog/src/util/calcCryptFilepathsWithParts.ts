/**
 * Calc crypt filepaths with cryptPath and its file parts.
 * @param cryptPath
 * @param cryptPathParts
 */
export function calcCryptPathsWithPart(cryptPath: string, cryptPathParts: string[]): string[] {
  return cryptPathParts.length > 1 ? cryptPathParts.map(part => cryptPath + part) : [cryptPath]
}
