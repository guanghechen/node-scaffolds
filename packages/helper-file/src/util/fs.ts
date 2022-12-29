import fs from 'node:fs'
import path from 'node:path'

/**
 * Collect all files under the given directory.
 *
 * @param dir
 * @param predicate
 */
export async function collectAllFiles(
  dir: string,
  predicate?: ((p: string, stat: fs.Stats) => Promise<boolean> | boolean) | null,
): Promise<string[]> {
  const results: string[] = []
  await collect(dir)
  return results

  async function collect(filepath: string): Promise<void> {
    const stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      const filenames = fs.readdirSync(filepath)
      for (const filename of filenames) {
        const nextFilepath = path.join(filepath, filename)
        await collect(nextFilepath)
      }
      return
    }

    if (stat.isFile()) {
      if (predicate == null || (await predicate(filepath, stat))) {
        results.push(filepath)
      }
    }
  }
}

/**
 * Collect all files under the given directory.   (synchronizing)
 *
 * @param dir
 * @param predicate
 */
export function collectAllFilesSync(
  dir: string,
  predicate?: ((p: string, stat: fs.Stats) => boolean) | null,
): string[] {
  const results: string[] = []
  collect(dir)
  return results

  function collect(filepath: string): void {
    const stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      const filenames = fs.readdirSync(filepath)
      for (const filename of filenames) {
        const nextFilepath = path.join(filepath, filename)
        collect(nextFilepath)
      }
      return
    }
    if (stat.isFile()) {
      if (predicate == null || predicate(filepath, stat)) {
        results.push(filepath)
      }
    }
  }
}
