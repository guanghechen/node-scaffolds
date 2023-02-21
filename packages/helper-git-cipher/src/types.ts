import type {
  IFileCipherCatalogDiffItemBase,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import type { IGitCommitInfo } from '@guanghechen/helper-git'

export interface IFileCipherCatalogItemInstance extends IFileCipherCatalogItemBase {
  authTag: Buffer | undefined
}

export interface IFileCipherCatalogItemData extends IFileCipherCatalogItemBase {
  authTag: string | undefined
}

export interface IGitCipherConfig {
  commit: {
    parents: string[]
    signature: IGitCommitInfo
  }
  catalog: {
    // Diff from the first parent commit.
    diffItems: Array<IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemInstance>>
    items: IFileCipherCatalogItemInstance[]
  }
}

export interface IGitCipherConfigData {
  commit: {
    parents: string[]
    signature: IGitCommitInfo
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
