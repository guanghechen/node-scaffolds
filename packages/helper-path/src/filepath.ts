import path from 'node:path'

/**
 * Calc absolute path of p under the workspace.
 *
 * @param workspace
 * @param targetPath
 */
export function absoluteOfWorkspace(workspace: string, targetPath?: string | null): string {
  if (!targetPath) return workspace
  const filepath: string = path.resolve(workspace, targetPath)
  return path.normalize(filepath)
}

/**
 * Calc relative path to workspace.
 *
 * @param workspace
 * @param targetPath
 */
export function relativeOfWorkspace(workspace: string, targetPath: string): string {
  const absoluteDir = absoluteOfWorkspace(workspace, targetPath)
  const filepath: string = path.relative(workspace, absoluteDir)
  return path.normalize(filepath)
}

/**
 * Resolve relative / absolute path under the given rootDir.
 */
export class FilepathResolver {
  public readonly rootDir: string

  constructor(rootDir: string) {
    this.rootDir = rootDir
  }

  /**
   * Resolve the absolute path of the given filepath.
   */
  public absolute(filepath: string): string {
    if (path.isAbsolute(filepath)) {
      if (path.relative(this.rootDir, filepath).startsWith('..')) {
        const title = this.constructor.name
        throw new Error(`[${title}.absolute] Not under the rootDir: ${filepath}`)
      }
      return filepath
    } else {
      return absoluteOfWorkspace(this.rootDir, filepath)
    }
  }

  /**
   * Resolve the relative path of the given filepath.
   */
  public relative(filepath: string): string {
    const relativeFilepath = relativeOfWorkspace(this.rootDir, filepath)
    if (path.isAbsolute(relativeFilepath) || relativeFilepath.startsWith('..')) {
      const title = this.constructor.name
      throw new Error(`[${title}.relative] Not under the rootDir: ${filepath}`)
    }
    return relativeFilepath.replace(/[/\\]+/g, '/')
  }
}
