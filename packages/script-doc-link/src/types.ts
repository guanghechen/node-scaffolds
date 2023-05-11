export type ITextTransformer = (text: string) => string

export interface IDocLinkRewriter {
  rewrite: ITextTransformer
}

export interface ITopPackageJson {
  author?: string | { name?: string } | undefined
  repository?: string | { url?: string } | undefined
  workspaces?: string[]
}

export interface IPackageJson {
  name?: string
  version?: string
}

export interface ILernaJson {
  version?: string
}
