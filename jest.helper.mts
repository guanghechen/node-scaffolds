import type { IDesensitizer } from '@guanghechen/helper-jest'
import {
  composeStringDesensitizers,
  createFilepathDesensitizer,
  createJsonDesensitizer,
} from '@guanghechen/helper-jest'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
export const workspaceRootDir = __dirname

/**
 * Desensitize test data.
 */
export const desensitize: IDesensitizer<any> & IDesensitizer<string> = createJsonDesensitizer({
  string: composeStringDesensitizers(
    createFilepathDesensitizer(workspaceRootDir, '<$WORKSPACE$>'),
    text => text.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, '<$Date$>'),
    text => text.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/, '<$ISO-Date$>'),
  ),
}) as IDesensitizer<any>

/**
 * Locate fixture filepath.
 * @param p
 * @returns
 */
export const locateFixtures = (...p: string[]): string => {
  const relativePackagePath: string = path
    .relative(workspaceRootDir, path.resolve())
    .split(path.sep)
    .slice(0, 2)
    .join(path.sep)
  const testRootDior: string = path.resolve(workspaceRootDir, relativePackagePath)
  return path.resolve(testRootDior, '__test__/fixtures', ...p)
}

/**
 * Load fixture filepath.
 * @param p
 * @returns
 */
export const loadFixtures = (...p: string[]): string =>
  fs.readFileSync(locateFixtures(...p), 'utf-8')

/**
 * Remove filepaths
 * @param filepaths
 */
export const unlinkSync = (...filepaths: Array<string | null | undefined | string[]>): void => {
  for (let filepath of filepaths) {
    if (filepath == null) continue
    if (!Array.isArray(filepath)) filepath = [filepath]
    for (const p of filepath) if (fs.existsSync(p)) fs.unlinkSync(p)
  }
}
