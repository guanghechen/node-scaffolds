import type {
  IFileCipherCatalogDiffItemBase,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'

export interface IFileCipherCatalogItemInstance extends IFileCipherCatalogItemBase {
  authTag: Buffer | undefined
}

export interface IFileCipherCatalogItemData extends IFileCipherCatalogItemBase {
  authTag: string | undefined
}

export interface IGitCipherConfig {
  commit: {
    message: string
    cryptParents: string[]
  }
  catalog: {
    // Diff from the first parent commit.
    diffItems: Array<IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemInstance>>
    items: IFileCipherCatalogItemInstance[]
  }
}

export interface IGitCipherConfigData {
  commit: {
    message: string
    cryptParents: string[]
  }
  catalog: {
    // Diff from the first parent commit.
    diffItems: Array<IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemData>>
    items: IFileCipherCatalogItemData[]
  }
}

export interface IGitCipherCommitIdData {
  commitIdMap: Record<string, string>
}
