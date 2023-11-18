import { text2bytes } from '@guanghechen/byte'
import type { IConfigKeeper } from '@guanghechen/config'
import type {
  IFileCipherBatcher,
  IFileCipherCatalogContext,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import { calcCryptFilepath } from '@guanghechen/helper-cipher-file'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IFileCipherCatalogItemInstance, IGitCipherConfig } from './types'

export interface IGitCipherContextProps {
  readonly catalogContext: IFileCipherCatalogContext
  readonly cipherBatcher: IFileCipherBatcher
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly reporter: IReporter | undefined
  getDynamicIv(infos: ReadonlyArray<Uint8Array>): Readonly<Uint8Array>
}

export interface IGitCipherContext {
  readonly catalogContext: IFileCipherCatalogContext
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cipherBatcher: IFileCipherBatcher
  readonly reporter: IReporter | undefined
  flatItem(item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem
  getIv(item: IFileCipherCatalogItemBase): Uint8Array
}

export class GitCipherContext implements IGitCipherContext {
  public readonly catalogContext: IFileCipherCatalogContext
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly reporter: IReporter | undefined
  public readonly getIv: (item: IFileCipherCatalogItemBase) => Uint8Array

  constructor(props: IGitCipherContextProps) {
    const { catalogContext, cipherBatcher, configKeeper, reporter, getDynamicIv } = props
    this.catalogContext = catalogContext
    this.cipherBatcher = cipherBatcher
    this.configKeeper = configKeeper
    this.reporter = reporter
    this.getIv = (item: IFileCipherCatalogItemBase): Uint8Array =>
      getDynamicIv([text2bytes(item.plainFilepath, 'utf8'), text2bytes(item.fingerprint, 'hex')])
  }

  public readonly flatItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem => {
    return {
      ...item,
      cryptFilepath: calcCryptFilepath(item.plainFilepath, this.catalogContext),
      iv: this.getIv(item),
      authTag: item.authTag,
    }
  }
}
