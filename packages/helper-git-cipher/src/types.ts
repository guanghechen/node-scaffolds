import type {
  IDeserializedCatalogDiffItem,
  IDeserializedCatalogItem,
  ISerializedCatalogDiffItem,
  ISerializedCatalogItem,
} from '@guanghechen/cipher-workspace.types'

export interface IGitCipherConfig {
  readonly commit: {
    readonly message: string
  }
  readonly catalog: {
    // Diff from the first parent commit.
    readonly diffItems: IDeserializedCatalogDiffItem[]
    readonly items: IDeserializedCatalogItem[]
  }
}

export interface IGitCipherConfigData {
  readonly commit: {
    readonly message: string
  }
  readonly catalog: {
    // Diff from the first parent commit.
    readonly diffItems: ISerializedCatalogDiffItem[]
    readonly items: ISerializedCatalogItem[]
  }
}

export interface IGitCipherCommitIdData {
  readonly commitIdMap: Record<string, string>
}
