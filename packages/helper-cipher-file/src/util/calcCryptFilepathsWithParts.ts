/**
 * Calc crypt filepaths with cryptFilepath and its file parts.
 * @param cryptFilepath
 * @param cryptFilepathParts
 */
export function calcCryptFilepathsWithParts(
  cryptFilepath: string,
  cryptFilepathParts: string[],
): string[] {
  return cryptFilepathParts.length > 1
    ? cryptFilepathParts.map(part => cryptFilepath + part)
    : [cryptFilepath]
}
