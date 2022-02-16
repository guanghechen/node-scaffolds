import fs from 'fs-extra'
import util from 'util'

export { isPlainObject } from 'is-plain-object'

/**
 * Stringify data
 * @param value
 */
export function stringify(value: unknown): string {
  return util.inspect(value, { breakLength: Infinity })
}

/**
 * Determine if it is a file
 * @param filePath
 */
export async function isFile(filePath: string): Promise<boolean> {
  const fileStats = await fs.stat(filePath)
  return fileStats.isFile()
}
