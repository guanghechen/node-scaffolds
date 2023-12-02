import { text2bytes } from '@guanghechen/byte'
import type {
  ICatalogItem,
  ICipherCatalog,
  ICipherCatalogContext,
  IDeserializedCatalogItem,
  IDraftCatalogItem,
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
  readonly calcIv: (infos: ReadonlyArray<Uint8Array>) => Readonly<Uint8Array>
}

export interface IGitCipherContext {
  readonly catalog: ICipherCatalog
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cipherBatcher: IFileCipherBatcher
  readonly reporter: IReporter
  flatItem(item: IDeserializedCatalogItem): ICatalogItem
  getIv(item: IDeserializedCatalogItem | IDraftCatalogItem): Uint8Array
}

export class GitCipherContext implements IGitCipherContext {
  public readonly catalog: ICipherCatalog
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly reporter: IReporter
  public readonly getIv: (item: IDeserializedCatalogItem) => Uint8Array

  constructor(props: IGitCipherContextProps) {
    const { catalogContext, cipherBatcher, configKeeper, reporter, calcIv } = props
    this.catalog = new FileCipherCatalog(catalogContext)
    this.cipherBatcher = cipherBatcher
    this.configKeeper = configKeeper
    this.reporter = reporter
    this.getIv = (item: IDeserializedCatalogItem | IDraftCatalogItem): Uint8Array =>
      calcIv([text2bytes(item.plainFilepath, 'utf8'), text2bytes(item.fingerprint, 'hex')])
  }

  public readonly flatItem = (item: IDeserializedCatalogItem): ICatalogItem => {
    const { catalog, getIv } = this
    return {
      ...item,
      cryptFilepath: catalog.calcCryptFilepath(item.plainFilepath),
      iv: getIv(item),
      authTag: item.authTag,
    }
  }
}
