import path from 'path'

/**
 * Calc absolute path of p under the workspace
 *
 * @param workspace
 * @param targetPath
 */
export function absoluteOfWorkspace(
  workspace: string,
  targetPath?: string | null,
): string {
  if (targetPath == null) return workspace
  const absoluteDir: string = path.resolve(workspace, targetPath)
  return absoluteDir
}

/**
 * Calc relative path to workspace
 *
 * @param workspace
 * @param targetDir
 */
export function relativeOfWorkspace(
  workspace: string,
  targetDir: string,
): string {
  const absoluteDir = absoluteOfWorkspace(workspace, targetDir)
  const relativeDir: string = path.relative(workspace, absoluteDir)
  return path.normalize(relativeDir)
}
