import micromatch from 'micromatch'
import path from 'node:path'

/**
 * Resolve the source path.
 *
 * @param workspace
 * @param srcPath
 * @returns
 */
export const resolvePath = (workspace: string, ...srcPath: string[]): string => {
  const filepath = path.resolve(workspace, ...srcPath)
  return filepath
}

/**
 * Get the path relative to workspace.
 *
 * @param workspace
 * @param filepath
 * @returns
 */
export const relativePath = (workspace: string, filepath: string): string => {
  const srcPath: string = filepath.startsWith(workspace)
    ? filepath.slice(workspace.length).replace(/^[/\\]/, '')
    : filepath
  return srcPath
}

/**
 * Test if the given filepath is matched with the glob patterns.
 *
 * @param workspace
 * @param filepath
 * @param patterns
 * @returns
 */
export const isMatch = (workspace: string, filepath: string, patterns: string[]): boolean => {
  const srcPath: string = relativePath(workspace, filepath)
  return micromatch.isMatch(srcPath, patterns, { dot: true })
}

/**
 * Find the expanded filepath based on the pattern.
 *
 * @param workspace
 * @param filepath
 * @param patterns
 */
export function findExpandedFilepath(
  workspace: string,
  filepath: string,
  patterns: string[],
): string {
  const srcPath: string = relativePath(workspace, filepath)
  const { base: filename, dir } = path.parse(srcPath)
  const dirs: string[] = dir.split(/[/\\]+/g)

  let i: number = dirs.length
  let p1: string
  let p2: string
  for (; i >= 0; --i) {
    p1 = dirs.slice(0, i).join('/')
    p2 = [p1, filename].join('/')
    const matched2: boolean = isMatch(workspace, p2, patterns)
    if (!matched2) break
  }

  if (i < 0) return filename
  else {
    p1 = dirs.slice(0, i + 1).join('/')
    const matched1: boolean = isMatch(workspace, p1!, patterns)
    if (matched1) return path.join(dirs.slice(i).join(path.sep), filename)
    return path.join(dirs.slice(i + 1).join(path.sep), filename)
  }
}
