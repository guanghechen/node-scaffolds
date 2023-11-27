import { text2bytes } from '@guanghechen/byte'
import type {
  ICatalogItem,
  ICipherCatalogContext,
  IDeserializedCatalogItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import type { IConfigKeeper } from '@guanghechen/config'
import type { IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
import { calcCryptFilepath } from '@guanghechen/helper-cipher-file'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherConfig } from './types'

export interface IGitCipherContextProps {
  readonly catalogContext: ICipherCatalogContext
  readonly cipherBatcher: IFileCipherBatcher
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly reporter: IReporter
  getDynamicIv(infos: ReadonlyArray<Uint8Array>): Readonly<Uint8Array>
}

export interface IGitCipherContext {
  readonly catalogContext: ICipherCatalogContext
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cipherBatcher: IFileCipherBatcher
  readonly reporter: IReporter
  flatItem(item: IDeserializedCatalogItem): ICatalogItem
  getIv(item: IDeserializedCatalogItem | IDraftCatalogItem): Uint8Array
}

export class GitCipherContext implements IGitCipherContext {
  public readonly catalogContext: ICipherCatalogContext
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly reporter: IReporter
  public readonly getIv: (item: IDeserializedCatalogItem) => Uint8Array

  constructor(props: IGitCipherContextProps) {
    const { catalogContext, cipherBatcher, configKeeper, reporter, getDynamicIv } = props
    this.catalogContext = catalogContext
    this.cipherBatcher = cipherBatcher
    this.configKeeper = configKeeper
    this.reporter = reporter
    this.getIv = (item: IDeserializedCatalogItem | IDraftCatalogItem): Uint8Array =>
      getDynamicIv([text2bytes(item.plainFilepath, 'utf8'), text2bytes(item.fingerprint, 'hex')])
  }

  public readonly flatItem = (item: IDeserializedCatalogItem): ICatalogItem => {
    return {
      ...item,
      cryptFilepath: calcCryptFilepath(item.plainFilepath, this.catalogContext),
      iv: this.getIv(item),
      authTag: item.authTag,
    }
  }
}
