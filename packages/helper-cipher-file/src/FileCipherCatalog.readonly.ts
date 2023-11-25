import type {
  ICatalogItem,
  ICipherCatalogContext,
  IDraftCatalogItem,
  IReadonlyCipherCatalog,
} from '@guanghechen/cipher-workspace.types'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import { calcCatalogItem } from './catalog/calcCatalogItem'
import { calcCryptFilepath } from './catalog/calcCryptFilepath'
import { checkCryptIntegrity } from './catalog/checkCryptIntegrity'
import { checkPlainIntegrity } from './catalog/checkPlainIntegrity'

export interface IReadonlyFileCipherCatalogProps {
  readonly context: ICipherCatalogContext
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export abstract class ReadonlyFileCipherCatalog implements IReadonlyCipherCatalog {
  public readonly context: ICipherCatalogContext
  public readonly cryptPathResolver: IWorkspacePathResolver
  public readonly plainPathResolver: IWorkspacePathResolver

  constructor(props: IReadonlyFileCipherCatalogProps) {
    this.context = props.context
    this.cryptPathResolver = props.cryptPathResolver
    this.plainPathResolver = props.plainPathResolver
  }

  // @override
  public abstract get items(): Iterable<ICatalogItem>

  // @override
  public async calcCatalogItem(plainFilepath: string): Promise<IDraftCatalogItem | never> {
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
