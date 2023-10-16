import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import { calcCatalogItem } from './catalog/calcCatalogItem'
import { calcCryptFilepath } from './catalog/calcCryptFilepath'
import { checkCryptIntegrity } from './catalog/checkCryptIntegrity'
import { checkPlainIntegrity } from './catalog/checkPlainIntegrity'
import type { IReadonlyFileCipherCatalog } from './types/IFileCipherCatalog'
import type { IFileCipherCatalogContext } from './types/IFileCipherCatalogContext'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'

export interface IReadonlyFileCipherCatalogProps {
  readonly context: IFileCipherCatalogContext
  readonly plainPathResolver: IWorkspacePathResolver
  readonly cryptPathResolver: IWorkspacePathResolver
}

export abstract class ReadonlyFileCipherCatalog implements IReadonlyFileCipherCatalog {
  public readonly context: IFileCipherCatalogContext
  public readonly cryptPathResolver: IWorkspacePathResolver
  public readonly plainPathResolver: IWorkspacePathResolver

  constructor(props: IReadonlyFileCipherCatalogProps) {
    this.context = props.context
    this.cryptPathResolver = props.cryptPathResolver
    this.plainPathResolver = props.plainPathResolver
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
  public async checkPlainIntegrity(plainFilepaths: string[]): Promise<void> {
    checkPlainIntegrity({
      items: this.items,
      plainFilepaths,
      plainPathResolver: this.plainPathResolver,
    })
  }

  // @override
  public async checkCryptIntegrity(cryptFilepaths: string[]): Promise<void> {
    checkCryptIntegrity({
      items: this.items,
      cryptFilepaths,
      cryptPathResolver: this.cryptPathResolver,
    })
  }
}
