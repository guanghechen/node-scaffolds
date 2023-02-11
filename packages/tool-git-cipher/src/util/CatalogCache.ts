import type { IConfigKeeper } from '@guanghechen/helper-config'
import { PlainJsonConfigKeeper } from '@guanghechen/helper-config'
import { existsSync } from 'node:fs'
import { logger } from '../env/logger'

export interface ICatalogCacheData {
  crypt2plainIdMap: Array<[cryptCommitId: string, plainCommitId: string]>
}

export class CatalogCacheKeeper
  extends PlainJsonConfigKeeper<ICatalogCacheData>
  implements IConfigKeeper<ICatalogCacheData>
{
  public override readonly __version__: string = '1.0.0'
  public override readonly __compatible_version__: string = '^1.0.0'

  public override async load(): Promise<void> {
    if (existsSync(this.filepath)) {
      try {
        await super.load()
      } catch (error) {
        logger.warn('Failed to load catalog cache (ignored).', error)
      }
    }
  }
}
