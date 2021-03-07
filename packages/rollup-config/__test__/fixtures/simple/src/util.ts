import fs from 'fs-extra'


/**
 * Check if the given filepath is an existed path of file.
 *
 * @param filepath
 * @returns
 */
export function isFileSync (filepath: string): boolean {
  if (!fs.existsSync(filepath)) return false
  return fs.statSync(filepath).isFile()
}
