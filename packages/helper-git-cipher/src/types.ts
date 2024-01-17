import type {
  ICipherCatalog,
  IDeserializedCatalogItem,
  ISerializedCatalogItem,
} from '@guanghechen/cipher-catalog.types'
import type { IConfigKeeper } from '@guanghechen/config'
import type { IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IReporter } from '@guanghechen/reporter.types'

export interface IGitCipherContext {
  readonly catalog: ICipherCatalog
  readonly catalogConfigPath: string
  readonly cipherBatcher: IFileCipherBatcher
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
  readonly reporter: IReporter
}

export interface IGitCipherConfig {
  readonly commit: {
    readonly message: string
  }
  readonly catalog: {
    readonly items: IDeserializedCatalogItem[]
  }
}

export interface IGitCipherConfigData {
  readonly commit: {
    readonly message: string
    readonly nonce: string
  }
  readonly catalog: {
    readonly items: ISerializedCatalogItem[]
  }
}

export interface IGitCipherCommitIdData {
  readonly commitIdMap: Record<string, string>
}
