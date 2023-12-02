import type {
  ICatalogItem,
  ICipherCatalog,
  ICipherCatalogContext,
  IDeserializedCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import type { IConfigKeeper } from '@guanghechen/config'
import type { IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
import { FileCipherCatalog } from '@guanghechen/helper-cipher-file'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherConfig } from './types'

export interface IGitCipherContextProps {
  readonly catalogContext: ICipherCatalogContext
  readonly cipherBatcher: IFileCipherBatcher
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly reporter: IReporter
}

export interface IGitCipherContext {
  readonly catalog: ICipherCatalog
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cipherBatcher: IFileCipherBatcher
  readonly reporter: IReporter
  flatItem(item: IDeserializedCatalogItem): Promise<ICatalogItem>
}

export class GitCipherContext implements IGitCipherContext {
  public readonly catalog: ICipherCatalog
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly reporter: IReporter

  constructor(props: IGitCipherContextProps) {
    const { catalogContext, cipherBatcher, configKeeper, reporter } = props
    this.catalog = new FileCipherCatalog(catalogContext)
    this.cipherBatcher = cipherBatcher
    this.configKeeper = configKeeper
    this.reporter = reporter
  }

  public readonly flatItem = async (item: IDeserializedCatalogItem): Promise<ICatalogItem> => {
    const { catalog } = this
    return {
      ...item,
      cryptFilepath: catalog.calcCryptFilepath(item.plainFilepath),
      iv: await catalog.getIv(item),
      authTag: item.authTag,
    }
  }
}
