export type ITextTransformer = (text: string) => string

export interface IDocLinkRewriter {
  rewrite: ITextTransformer
}

export interface IDocScanner {
  scan(): Promise<string[]> // Absolute doc filepaths.
}

export interface ITopPackageJson {
  author?: string | { name?: string } | undefined
  repository?: string | { url?: string } | undefined
  workspaces?: string[]
}

export interface IPackageJson {
  name?: string
  version?: string
  private?: boolean
}

export interface ILernaJson {
  version?: string
}
