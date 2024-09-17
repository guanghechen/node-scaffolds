export type ITextTransformer = (text: string) => string

export interface IMonorepoRewriteAbleItem {
  readonly filepath: string
  readonly packagePath: string
}

export interface ITopPackageJson {
  readonly author?: string | { name?: string } | undefined
  readonly repository?: string | { url?: string } | undefined
  readonly workspaces?: string[]
}

export interface IPackageJson {
  readonly name?: string
  readonly version?: string
  readonly private?: boolean
}

export interface ILernaJson {
  readonly version?: string
}
