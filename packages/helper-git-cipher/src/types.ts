import type {
  ICipherCatalog,
  IDeserializedCatalogDiffItem,
  IDeserializedCatalogItem,
  ISerializedCatalogDiffItem,
  ISerializedCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import type { IConfigKeeper } from '@guanghechen/config'
import type { IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
import type { IReporter } from '@guanghechen/reporter.types'

export interface IGitCipherContext {
  readonly catalog: ICipherCatalog
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cipherBatcher: IFileCipherBatcher
  readonly reporter: IReporter
}

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
