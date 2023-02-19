import type {
  IFileCipherCatalogDiffItemBase,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import type { IGitCommitInfo } from '@guanghechen/helper-git'

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
    diffItems: Array<IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemData>>
    items: IFileCipherCatalogItemData[]
  }
}

export interface IGitCipherCommitIdData {
  commitIdMap: Record<string, string>
}
