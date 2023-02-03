import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
} from '@guanghechen/helper-cipher-file'
import type { IGitCommitInfo } from '@guanghechen/helper-git'

export interface IGitCommitOverview {
  id: string
  parents: string[]
  signature: IGitCommitInfo
  catalog: {
    items: IFileCipherCatalogItem[]
    // Diff from the first parent commit.
    diffItems: IFileCipherCatalogItemDiff[]
  }
}

export interface IGitCipherConfigData {
  commit: IGitCommitOverview
}

export interface IGitCipherCommitIdData {
  commitIdMap: Record<string, string>
}
