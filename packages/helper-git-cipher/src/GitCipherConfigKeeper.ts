import type { IFileCipherCatalogItemBase } from '@guanghechen/helper-cipher-file'
import { CipherJsonConfigKeeper } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import invariant from '@guanghechen/invariant'
import type { PromiseOr } from '@guanghechen/utility-types'
import path from 'node:path'
import type { IGitCipherConfig } from './types'

type Instance = IGitCipherConfig
type Data = IGitCipherConfig

export class GitCipherConfigKeeper
  extends CipherJsonConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  public override readonly __version__ = '2.0.0'
  public override readonly __compatible_version__ = '^1.0.0 || ^2.0.0'

  protected serialize(instance: Instance): PromiseOr<Data> {
    return {
      commit: instance.commit,
      catalog: {
        diffItems: instance.catalog.diffItems.slice(),
        items: instance.catalog.items.map(item => ({
          fingerprint: item.fingerprint,
          plainFilepath: item.plainFilepath,
          size: item.size,
          keepPlain: item.keepPlain,
          authTag: item.authTag,
        })),
      },
    }
  }

  protected deserialize(data: Data): PromiseOr<Instance> {
    return {
      commit: data.commit,
      catalog: {
        diffItems: data.catalog.diffItems.slice(),
        items: data.catalog.items.map(item => ({
          fingerprint: item.fingerprint,
          plainFilepath: item.plainFilepath,
          size: item.size,
          keepPlain: item.keepPlain,
          authTag: item.authTag,
        })),
      },
    }
  }

  protected override async stringify(data: Data): Promise<string> {
    let badItem: IFileCipherCatalogItemBase | null = null
    const { items } = data.catalog
    for (const item of items) {
      /* c8 ignore start */
      if (path.isAbsolute(item.plainFilepath)) {
        badItem = item
        break
      }
      /* c8 ignore end */
    }

    invariant(
      !badItem,
      `[encryptGitCommit] bad catalog, contains absolute filepaths. plainFilepath:(${badItem?.plainFilepath})`,
    )
    return super.stringify(data)
  }
}