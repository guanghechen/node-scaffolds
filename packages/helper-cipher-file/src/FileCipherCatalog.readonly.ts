import type { FilepathResolver } from '@guanghechen/helper-path'
import { calcCatalogItem } from './catalog/calcCatalogItem'
import { calcCryptFilepath } from './catalog/calcCryptFilepath'
import { checkCryptIntegrity } from './catalog/checkCryptIntegrity'
import { checkPlainIntegrity } from './catalog/checkPlainIntegrity'
import type {
  ICatalogCheckCryptIntegrityParams,
  ICatalogCheckPlainIntegrityParams,
  IReadonlyFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type { IFileCipherCatalogContext } from './types/IFileCipherCatalogContext'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'

export interface IReadonlyFileCipherCatalogProps {
  readonly context: IFileCipherCatalogContext
  readonly plainPathResolver: FilepathResolver
}

export abstract class ReadonlyFileCipherCatalog implements IReadonlyFileCipherCatalog {
  public readonly plainPathResolver: FilepathResolver
  public readonly context: IFileCipherCatalogContext

  constructor(props: IReadonlyFileCipherCatalogProps) {
    this.plainPathResolver = props.plainPathResolver
    this.context = props.context
  }

  // @override
  public abstract get items(): Iterable<IFileCipherCatalogItem>

  // @override
  public async calcCatalogItem(
    plainFilepath: string,
  ): Promise<IFileCipherCatalogItemDraft | never> {
    return calcCatalogItem({
      context: this.context,
      plainFilepath,
      plainPathResolver: this.plainPathResolver,
    })
  }

  // override
  public calcCryptFilepath(plainFilepath: string): string {
    const relativePlainFilepath = this.plainPathResolver.relative(plainFilepath)
    return calcCryptFilepath(relativePlainFilepath, this.context)
  }

  // @override
  public async checkPlainIntegrity(params: ICatalogCheckPlainIntegrityParams): Promise<void> {
    checkPlainIntegrity({
      items: this.items,
      plainFilepaths: params.plainFilepaths,
      plainPathResolver: this.plainPathResolver,
    })
  }

  // @override
  public async checkCryptIntegrity(params: ICatalogCheckCryptIntegrityParams): Promise<void> {
    checkCryptIntegrity({
      items: this.items,
      cryptFilepaths: params.cryptFilepaths,
      cryptPathResolver: params.cryptPathResolver,
    })
  }
}
