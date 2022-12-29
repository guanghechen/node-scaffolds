import fs from 'node:fs'
import path from 'node:path'
import type { IStringDesensitizer } from '../desensitizer/types'

/**
 * Create snapshot for give filepaths.
 *
 * @param baseDir
 * @param filenames
 * @param desensitize
 * @param encoding
 */
export function fileSnapshot(
  baseDir: string,
  filenames: string[],
  desensitize?: IStringDesensitizer,
  encoding: BufferEncoding = 'utf-8',
): void {
  for (const filename of filenames) {
    const filepath = path.join(baseDir, filename)
    expect(fs.existsSync(filepath)).toBeTruthy()

    const content: string = fs.readFileSync(filepath, encoding)
    const desensitizedContent = desensitize != null ? desensitize(content) : content
    expect(desensitizedContent).toMatchSnapshot(filename)
  }
}
