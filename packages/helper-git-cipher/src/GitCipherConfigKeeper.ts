import { bytes2text, text2bytes } from '@guanghechen/byte'
import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import type { IDeserializedCatalogItem, ISerializedCatalogItem } from '@guanghechen/cipher-catalog'
import { CatalogItemFlagEnum } from '@guanghechen/cipher-catalog'
import type { IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/config'
import { JsonConfigKeeper } from '@guanghechen/config'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/filepart'
import invariant from '@guanghechen/invariant'
import path from 'node:path'
import type { IGitCipherConfig, IGitCipherConfigData } from './types'

type Instance = IGitCipherConfig
type Data = IGitCipherConfigData

export interface IGitCipherConfigKeeperProps extends IJsonConfigKeeperProps {
  readonly MAX_CRYPT_FILE_SIZE: number
  readonly PART_CODE_PREFIX: string
  readonly cipherFactory: ICipherFactory
  readonly genNonceByCommitMessage: (message: string) => Uint8Array
}

const clazz = 'GitCipherConfigKeeper'

export class GitCipherConfigKeeper
  extends JsonConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  public override readonly __version__ = '6.0.0'
  public override readonly __compatible_version__ = '~6.0.0'
  protected readonly MAX_CRYPT_FILE_SIZE: number
  protected readonly PART_CODE_PREFIX: string
  protected readonly genNonceByCommitMessage: (message: string) => Uint8Array
  readonly #cipherFactory: ICipherFactory

  constructor(props: IGitCipherConfigKeeperProps) {
    super(props)
    this.MAX_CRYPT_FILE_SIZE = props.MAX_CRYPT_FILE_SIZE
    this.PART_CODE_PREFIX = props.PART_CODE_PREFIX
    this.genNonceByCommitMessage = props.genNonceByCommitMessage
    this.#cipherFactory = props.cipherFactory
  }

  protected override nonce(): string | undefined {
    return undefined
  }

  protected override async serialize(instance: Instance): Promise<Data> {
    const cipherFactory: ICipherFactory = this.#cipherFactory

    const serializeItem = (item: IDeserializedCatalogItem): ISerializedCatalogItem => {
      invariant(
        !path.isAbsolute(item.plainPath),
        `[${clazz}] bad catalog, contains absolute filepaths. plainFilepath:(${item.plainPath})`,
      )

      const cipher: ICipher = cipherFactory.cipher({ iv: item.nonce })
      const authTag: string | undefined =
        item.authTag === undefined
          ? undefined
          : bytes2text(cipher.encrypt(Uint8Array.from(item.authTag)).cryptBytes, 'hex')
      const nonce: string = bytes2text(item.nonce, 'hex')
      const fingerprint: string = item.fingerprint
      let flag: CatalogItemFlagEnum = CatalogItemFlagEnum.NONE
      if (item.keepIntegrity) flag |= CatalogItemFlagEnum.KEEP_INTEGRITY
      if (item.keepPlain) flag |= CatalogItemFlagEnum.KEEP_PLAIN

      if (item.keepPlain) {
        return {
          authTag,
          fingerprint,
          flag,
          nonce,
          plainPath: item.plainPath,
          size: item.size,
        }
      }

      const { cryptBytes: ePlainPath } = cipher.encrypt(text2bytes(item.plainPath, 'utf8'))
      const { cryptBytes: eFingerprint } = cipher.encrypt(text2bytes(item.fingerprint, 'hex'))
      return {
        authTag,
        fingerprint: bytes2text(eFingerprint, 'hex'),
        flag,
        nonce,
        plainPath: bytes2text(ePlainPath, 'base64'),
        size: item.size,
      }
    }

    const commitNonce: Uint8Array = this.genNonceByCommitMessage(instance.commit.message)
    const commitMessageCipher: ICipher = cipherFactory.cipher({ iv: commitNonce })
    const commitMessage: string = bytes2text(
      commitMessageCipher.encrypt(text2bytes(instance.commit.message, 'utf8')).cryptBytes,
      'base64',
    )

    return {
      commit: {
        message: commitMessage,
        nonce: bytes2text(commitNonce, 'hex'),
      },
      catalog: {
        items: Array.from(instance.catalog.items)
          .sort((x, y) => this.compareItem(x, y))
          .map(serializeItem),
      },
    }
  }

  protected override async deserialize(data: Data): Promise<Instance> {
    const { MAX_CRYPT_FILE_SIZE, PART_CODE_PREFIX } = this
    const cipherFactory: ICipherFactory = this.#cipherFactory

    const deserializeItem = (item: ISerializedCatalogItem): IDeserializedCatalogItem => {
      const nonce: Uint8Array = text2bytes(item.nonce, 'hex')
      const cipher = cipherFactory.cipher({ iv: nonce })
      const authTag: Uint8Array | undefined = item.authTag
        ? cipher.decrypt(text2bytes(item.authTag, 'hex'))
        : undefined
      const keepPlain: boolean =
        (item.flag & CatalogItemFlagEnum.KEEP_PLAIN) === CatalogItemFlagEnum.KEEP_PLAIN
      const keepIntegrity: boolean =
        (item.flag & CatalogItemFlagEnum.KEEP_INTEGRITY) === CatalogItemFlagEnum.KEEP_INTEGRITY
      const cryptPathParts: string[] = Array.from(
        calcFilePartNames(
          Array.from(calcFilePartItemsBySize(item.size, MAX_CRYPT_FILE_SIZE)),
          PART_CODE_PREFIX,
        ),
      )

      if (keepPlain) {
        return {
          authTag,
          cryptPathParts,
          fingerprint: item.fingerprint,
          keepPlain,
          keepIntegrity,
          nonce,
          plainPath: item.plainPath,
          size: item.size,
        }
      }

      const plainPath: string = bytes2text(
        cipher.decrypt(text2bytes(item.plainPath, 'base64')),
        'utf8',
      )
      const fingerprint: string = bytes2text(
        cipher.decrypt(text2bytes(item.fingerprint, 'hex')),
        'hex',
      )
      return {
        authTag,
        cryptPathParts,
        fingerprint,
        keepPlain,
        keepIntegrity,
        nonce,
        plainPath,
        size: item.size,
      }
    }

    const commitNonce: Uint8Array = text2bytes(data.commit.nonce, 'hex')
    const commitMessageCipher: ICipher = cipherFactory.cipher({ iv: commitNonce })
    const commitMessage: string = bytes2text(
      commitMessageCipher.decrypt(text2bytes(data.commit.message, 'base64')),
      'utf8',
    )

    return {
      commit: {
        message: commitMessage,
      },
      catalog: {
        items: data.catalog.items.map(deserializeItem),
      },
    }
  }

  protected compareItem(
    item1: IDeserializedCatalogItem,
    item2: IDeserializedCatalogItem,
  ): -1 | 0 | 1 {
    let i: number = item1.plainPath.length - 1
    let j: number = item2.plainPath.length - 1
    for (; i >= 0 && j >= 0; --i, --j) {
      const x: string = item1.plainPath[i]
      const y: string = item2.plainPath[j]
      if (x === y) continue
      return x < y ? -1 : 1
    }
    if (i < 0) return j < 0 ? 0 : -1
    return 1
  }
}
