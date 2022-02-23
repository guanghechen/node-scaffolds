import path from 'path'

/**
 * Resolve the source path.
 * @param workspace
 * @param srcPath
 * @returns
 */
export const resolvePath = (workspace: string, srcPath: string): string => {
  const filepath = path.resolve(workspace, srcPath)
  return filepath
}

/**
 * Get the path relative to workspace.
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
