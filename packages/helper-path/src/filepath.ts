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
