import type {
  IFileCipherBatcher,
  IFileCipherCatalogContext,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import { calcCryptFilepath } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { ILogger } from '@guanghechen/utility-types'
import type { IFileCipherCatalogItemInstance, IGitCipherConfig } from './types'

export interface IGitCipherContextProps {
  readonly catalogContext: IFileCipherCatalogContext
  readonly cipherBatcher: IFileCipherBatcher
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly logger: ILogger | undefined
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export interface IGitCipherContext {
  readonly catalogContext: IFileCipherCatalogContext
  readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  readonly cipherBatcher: IFileCipherBatcher
  readonly logger: ILogger | undefined
  flatItem(item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem
  getIv(item: IFileCipherCatalogItemBase): Buffer
}

export class GitCipherContext implements IGitCipherContext {
  public readonly catalogContext: IFileCipherCatalogContext
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly logger: ILogger | undefined
  public readonly getIv: (item: IFileCipherCatalogItemBase) => Buffer

  constructor(props: IGitCipherContextProps) {
    const { catalogContext, cipherBatcher, configKeeper, logger, getDynamicIv } = props
    this.catalogContext = catalogContext
    this.cipherBatcher = cipherBatcher
    this.configKeeper = configKeeper
    this.logger = logger
    this.getIv = (item: IFileCipherCatalogItemBase): Buffer =>
      getDynamicIv([Buffer.from(item.plainFilepath, 'utf8'), Buffer.from(item.fingerprint, 'hex')])
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
