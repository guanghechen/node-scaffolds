import type { IConfigKeeper } from '@guanghechen/helper-config'
import { JsonConfigKeeper } from '@guanghechen/helper-config'
import type { PromiseOr } from '@guanghechen/utility-types'
import { logger } from '../core/logger'

export interface ICatalogCache {
  crypt2plainIdMap: Map<string, string>
}

export interface ICatalogCacheData {
  crypt2plainIdMap: Array<[cryptCommitId: string, plainCommitId: string]>
}

export class CatalogCacheKeeper
  extends JsonConfigKeeper<ICatalogCache, ICatalogCacheData>
  implements IConfigKeeper<ICatalogCache>
{
  public override readonly __version__: string = '1.0.0'
  public override readonly __compatible_version__: string = '^1.0.0'

  public override async load(): Promise<void> {
    if (await this._storage.exists()) {
      try {
        await super.load()
      } catch (error) {
        logger.warn('Failed to load catalog cache (ignored).', error)
      }
    }
  }

  protected override serialize(instance: ICatalogCache): PromiseOr<ICatalogCacheData> {
    return {
      crypt2plainIdMap: Array.from(instance.crypt2plainIdMap),
    }
  }

  protected override deserialize(data: ICatalogCacheData): PromiseOr<ICatalogCache> {
    return {
      crypt2plainIdMap: new Map(data.crypt2plainIdMap),
    }
  }
}
