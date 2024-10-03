export interface IGenProjectJSONParams {
  rollupConfigFilename: string
  hasTests: boolean
  packageName: string
  workspaceName: string
}

export interface IDepsInfo {
  dependencies: string[]
  devDependencies: string[]
}

export function checkDepsInfo(WORKSPACE_ROOT: string, workspaceNames: string[]): Promise<IDepsInfo>

export function genProjects(WORKSPACE_ROOT: string, workspaceNames: string[]): Promise<void>

export function genProjectJSON(params: IGenProjectJSONParams): string
