import type { ICipher } from '@guanghechen/cipher'
import type { IFileCipherCatalogDiffItemBase } from '@guanghechen/helper-cipher-file'
import { FileChangeType } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/helper-config'
import { JsonConfigKeeper } from '@guanghechen/helper-config'
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

export interface IGitCipherConfigKeeperProps extends IJsonConfigKeeperProps {
  readonly cipher: ICipher
}

export class GitCipherConfigKeeper
  extends JsonConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  public override readonly __version__ = '5.1.0'
  public override readonly __compatible_version__ = '~5.1.0'
  readonly #cipher: ICipher

  constructor(props: IGitCipherConfigKeeperProps) {
    super(props)
    this.#cipher = props.cipher
  }

  protected override nonce(): string | undefined {
    return undefined
  }

  protected override serialize(instance: Instance): PromiseOr<Data> {
    const title = this.constructor.name
    const cipher = this.#cipher

    const serializeItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItemData => {
      invariant(
        !path.isAbsolute(item.plainFilepath),
        `[${title}] bad catalog, contains absolute filepaths. plainFilepath:(${item.plainFilepath})`,
      )

      const eAuthTag: Buffer | undefined = item.authTag
        ? cipher.encrypt(Buffer.from(item.authTag)).cryptBytes
        : undefined

      if (item.keepPlain) {
        return {
          plainFilepath: item.plainFilepath,
          fingerprint: item.fingerprint,
          cryptFilepathParts: item.cryptFilepathParts,
          keepPlain: true,
          authTag: eAuthTag?.toString('hex'),
        }
      }

      const ePlainFilepath: Buffer = cipher.encrypt(Buffer.from(item.plainFilepath)).cryptBytes
      const eFingerprint: Buffer = cipher.encrypt(Buffer.from(item.fingerprint, 'hex')).cryptBytes
      return {
        plainFilepath: ePlainFilepath.toString('base64'),
        fingerprint: eFingerprint.toString('hex'),
        cryptFilepathParts: item.cryptFilepathParts,
        keepPlain: false,
        authTag: eAuthTag?.toString('hex'),
      }
    }

    const commitMessage: string = cipher
      .encrypt(Buffer.from(instance.commit.message))
      .cryptBytes.toString('base64')

    return {
      commit: {
        message: commitMessage,
      },
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
        items: instance.catalog.items
          .sort((x, y) => x.plainFilepath.localeCompare(y.plainFilepath))
          .map(serializeItem),
      },
    }
  }

  protected override deserialize(data: Data): PromiseOr<Instance> {
    const title = this.constructor.name
    const cipher = this.#cipher

    const deserializeItem = (item: IFileCipherCatalogItemData): IFileCipherCatalogItemInstance => {
      const authTag: Buffer | undefined = item.authTag
        ? cipher.decrypt(Buffer.from(item.authTag, 'hex'))
        : undefined

      if (item.keepPlain) {
        return {
          plainFilepath: item.plainFilepath,
          fingerprint: item.fingerprint,
          cryptFilepathParts: item.cryptFilepathParts,
          keepPlain: true,
          authTag,
        }
      }

      const plainFilepath: string = cipher
        .decrypt(Buffer.from(item.plainFilepath, 'base64'))
        .toString()
      const fingerprint: string = cipher
        .decrypt(Buffer.from(item.fingerprint, 'hex'))
        .toString('hex')
      return {
        plainFilepath,
        fingerprint,
        cryptFilepathParts: item.cryptFilepathParts,
        keepPlain: false,
        authTag,
      }
    }

    const commitMessage: string = cipher
      .decrypt(Buffer.from(data.commit.message, 'base64'))
      .toString()

    return {
      commit: {
        message: commitMessage,
      },
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
}
