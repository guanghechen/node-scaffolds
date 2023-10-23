import type {
  IFileCipherCatalogDiffItemBase,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'

export interface IFileCipherCatalogItemInstance extends IFileCipherCatalogItemBase {
  readonly authTag: Readonly<Uint8Array> | undefined
}

export interface IFileCipherCatalogItemData extends IFileCipherCatalogItemBase {
  readonly authTag: string | undefined
}

export interface IGitCipherConfig {
  readonly commit: {
    readonly message: string
  }
  readonly catalog: {
    // Diff from the first parent commit.
    readonly diffItems: Array<IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemInstance>>
    readonly items: IFileCipherCatalogItemInstance[]
  }
}

export interface IGitCipherConfigData {
  readonly commit: {
    readonly message: string
  }
  readonly catalog: {
    // Diff from the first parent commit.
    readonly diffItems: Array<IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemData>>
    readonly items: IFileCipherCatalogItemData[]
  }
}

export interface IGitCipherCommitIdData {
  readonly commitIdMap: Record<string, string>
}
