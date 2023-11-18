import type { IConfigKeeper } from '@guanghechen/config'
import { JsonConfigKeeper } from '@guanghechen/config'
import { reporter } from '../core/reporter'

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
    if (await this._resource.exists()) {
      try {
        await super.load()
      } catch (error) {
        reporter.warn('Failed to load catalog cache (ignored).', error)
      }
    }
  }

  protected override async serialize(instance: ICatalogCache): Promise<ICatalogCacheData> {
    return {
      crypt2plainIdMap: Array.from(instance.crypt2plainIdMap),
    }
  }

  protected override async deserialize(data: ICatalogCacheData): Promise<ICatalogCache> {
    return {
      crypt2plainIdMap: new Map(data.crypt2plainIdMap),
    }
  }
}
