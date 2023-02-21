import type {
  IFileCipherCatalogDiffItemBase,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import { CipherJsonConfigKeeper, FileChangeType } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import invariant from '@guanghechen/invariant'
import type { PromiseOr } from '@guanghechen/utility-types'
import path from 'node:path'
import type {
  IFileCipherCatalogItemData,
  IFileCipherCatalogItemInstance,
  IGitCipherConfig,
  IGitCipherConfigData,
} from './types'

type Instance = IGitCipherConfig
type Data = IGitCipherConfigData

export class GitCipherConfigKeeper
  extends CipherJsonConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  public override readonly __version__ = '2.0.0'
  public override readonly __compatible_version__ = '^1.0.0 || ^2.0.0'

  protected serialize(instance: Instance): PromiseOr<Data> {
    const serializeItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItemData => ({
      plainFilepath: item.plainFilepath,
      fingerprint: item.fingerprint,
      size: item.size,
      keepPlain: item.keepPlain,
      authTag: item.authTag?.toString('hex'),
    })
    const title = this.constructor.name

    return {
      commit: instance.commit,
      catalog: {
        diffItems: instance.catalog.diffItems.map(
          (diffItem): IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemData> => {
            switch (diffItem.changeType) {
              case FileChangeType.ADDED:
                return {
                  changeType: diffItem.changeType,
                  newItem: serializeItem(diffItem.newItem),
                }
              case FileChangeType.MODIFIED:
                return {
                  changeType: diffItem.changeType,
                  oldItem: serializeItem(diffItem.oldItem),
                  newItem: serializeItem(diffItem.newItem),
                }
              case FileChangeType.REMOVED:
                return {
                  changeType: diffItem.changeType,
                  oldItem: serializeItem(diffItem.oldItem),
                }
              /* c8 ignore start */
              default:
                throw new Error(`[${title} unknown changeType`)
              /* c8 ignore end */
            }
          },
        ),
        items: instance.catalog.items.map(serializeItem),
      },
    }
  }

  protected deserialize(data: Data): PromiseOr<Instance> {
    const deserializeItem = (item: IFileCipherCatalogItemData): IFileCipherCatalogItemInstance => ({
      plainFilepath: item.plainFilepath,
      fingerprint: item.fingerprint,
      size: item.size,
      keepPlain: item.keepPlain,
      authTag: item.authTag ? Buffer.from(item.authTag, 'hex') : undefined,
    })
    const title = this.constructor.name

    return {
      commit: data.commit,
      catalog: {
        diffItems: data.catalog.diffItems.map(
          (diffItem): IFileCipherCatalogDiffItemBase<IFileCipherCatalogItemInstance> => {
            switch (diffItem.changeType) {
              case FileChangeType.ADDED:
                return {
                  changeType: diffItem.changeType,
                  newItem: deserializeItem(diffItem.newItem),
                }
              case FileChangeType.MODIFIED:
                return {
                  changeType: diffItem.changeType,
                  oldItem: deserializeItem(diffItem.oldItem),
                  newItem: deserializeItem(diffItem.newItem),
                }
              case FileChangeType.REMOVED:
                return {
                  changeType: diffItem.changeType,
                  oldItem: deserializeItem(diffItem.oldItem),
                }
              /* c8 ignore start */
              default:
                throw new Error(`[${title} unknown changeType`)
              /* c8 ignore end */
            }
          },
        ),
        items: data.catalog.items.map(deserializeItem),
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
