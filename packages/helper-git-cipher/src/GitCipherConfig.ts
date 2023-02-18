import type { IFileCipherCatalogItem } from '@guanghechen/helper-cipher-file'
import { PlainCipherJsonConfigKeeper } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import invariant from '@guanghechen/invariant'
import path from 'node:path'
import type { IGitCipherConfigData } from './types'

export class GitCipherConfig
  extends PlainCipherJsonConfigKeeper<IGitCipherConfigData>
  implements IConfigKeeper<IGitCipherConfigData>
{
  public override readonly __version__ = '1.0.0'
  public override readonly __compatible_version__ = '^1.0.0'

  protected override async stringify(data: IGitCipherConfigData): Promise<string> {
    let badItem: IFileCipherCatalogItem | null = null
    const { items } = data.commit.catalog
    for (const item of items) {
      /* c8 ignore start */
      if (path.isAbsolute(item.plainFilepath) || path.isAbsolute(item.cryptFilepath)) {
        badItem = item
        break
      }
      /* c8 ignore end */
    }

    invariant(
      !badItem,
      `[encryptGitCommit] bad catalog, contains absolute filepaths. plainFilepath:(${badItem?.plainFilepath}), cryptFilepath:(${badItem?.cryptFilepath})`,
    )
    return super.stringify(data)
  }
}
