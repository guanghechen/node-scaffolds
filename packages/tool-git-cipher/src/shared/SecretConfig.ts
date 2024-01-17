import { bytes2text, text2bytes } from '@guanghechen/byte'
import type { ICipher } from '@guanghechen/cipher'
import type { ICipherCatalogContext } from '@guanghechen/cipher-catalog.types'
import type { IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/config'
import { JsonConfigKeeper, PlainJsonConfigKeeper } from '@guanghechen/config'
import { GitCipherCatalogContext } from '@guanghechen/helper-git-cipher'
import type { IHashAlgorithm } from '@guanghechen/mac'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import { pathResolver } from '@guanghechen/path'
import type { ISecretConfig, ISecretConfigData } from './SecretConfig.types'

type Instance = ISecretConfig
type Data = ISecretConfigData

export const encodeCryptBytes = (key: Uint8Array): string => bytes2text(key, 'hex')
export const decodeCryptBytes = (key: string): Uint8Array => text2bytes(key, 'hex')

export const encodeAuthTag = (authTag: Uint8Array | undefined): string | undefined =>
  authTag === undefined ? undefined : bytes2text(authTag, 'hex')
export const decodeAuthTag = (authTag: string | undefined): Uint8Array | undefined =>
  authTag === undefined ? undefined : text2bytes(authTag, 'hex')

export const secretConfigHashAlgorithm: IHashAlgorithm | undefined = 'sha256'
const __version__ = '3.0.0'
const __compatible_version__ = '~3.0.0'

export class CryptSecretConfigKeeper
  extends PlainJsonConfigKeeper<Data>
  implements IConfigKeeper<Data>
{
  public override readonly __version__: string = __version__
  public override readonly __compatible_version__: string = __compatible_version__
}

export interface ISecretConfigKeeperProps extends IJsonConfigKeeperProps {
  readonly cipher: ICipher
  readonly cryptRootDir: string
}

export class SecretConfigKeeper
  extends JsonConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  public override readonly __version__: string = __version__
  public override readonly __compatible_version__: string = __compatible_version__
  readonly #cryptRootDir: string
  readonly #cipher: ICipher

  constructor(props: ISecretConfigKeeperProps) {
    super({ ...props, hashAlgorithm: secretConfigHashAlgorithm })
    this.#cryptRootDir = props.cryptRootDir
    this.#cipher = props.cipher
  }

  public createCatalogContext(params: {
    NONCE_SIZE: number
    cryptPathResolver: IWorkspacePathResolver
    plainPathResolver: IWorkspacePathResolver
  }): ICipherCatalogContext | undefined {
    if (this.data) {
      const { NONCE_SIZE, cryptPathResolver, plainPathResolver } = params
      const {
        contentHashAlgorithm,
        cryptFilesDir,
        cryptPathSalt,
        integrityPatterns,
        keepPlainPatterns,
        maxCryptFileSize = Number.POSITIVE_INFINITY,
        partCodePrefix,
        pathHashAlgorithm,
      } = this.data
      const catalogContext: ICipherCatalogContext = new GitCipherCatalogContext({
        CONTENT_HASH_ALGORITHM: contentHashAlgorithm,
        CRYPT_FILES_DIR: cryptFilesDir,
        CRYPT_PATH_SALT: cryptPathSalt,
        MAX_CRYPT_FILE_SIZE: maxCryptFileSize,
        NONCE_SIZE,
        PART_CODE_PREFIX: partCodePrefix,
        PATH_HASH_ALGORITHM: pathHashAlgorithm,
        cryptPathResolver,
        plainPathResolver,
        integrityPatterns,
        keepPlainPatterns,
      })
      return catalogContext
    }
    return undefined
  }

  protected override async serialize(instance: Instance): Promise<Data> {
    const cipher = this.#cipher

    const eCryptFilepathSalt = cipher.encrypt(text2bytes(instance.cryptPathSalt, 'utf8'))
    const eSecretNonce = cipher.encrypt(instance.secretNonce)

    const CRYPT_PATH_SALT: string = encodeCryptBytes(eCryptFilepathSalt.cryptBytes)
    const CRYPT_PATH_SALT_AUTH_TAG: string | undefined = encodeAuthTag(eCryptFilepathSalt.authTag)
    const secretNonce: string = encodeCryptBytes(eSecretNonce.cryptBytes)

    const secret: string = encodeCryptBytes(instance.secret) // pre-encrypted
    const secretAuthTag: string | undefined = encodeAuthTag(instance.secretAuthTag) // pre-encrypted

    return {
      catalogConfigPath: pathResolver.safeRelative(
        this.#cryptRootDir,
        instance.catalogConfigPath,
        true,
      ),
      contentHashAlgorithm: instance.contentHashAlgorithm,
      cryptPathSalt: CRYPT_PATH_SALT,
      cryptPathSaltAuthTag: CRYPT_PATH_SALT_AUTH_TAG,
      cryptFilesDir: pathResolver.safeRelative(this.#cryptRootDir, instance.cryptFilesDir, true),
      integrityPatterns: instance.integrityPatterns,
      keepPlainPatterns: instance.keepPlainPatterns,
      mainIvSize: instance.mainIvSize,
      mainKeySize: instance.mainKeySize,
      maxCryptFileSize:
        (instance.maxCryptFileSize ?? Number.POSITIVE_INFINITY) > Number.MAX_SAFE_INTEGER
          ? undefined
          : instance.maxCryptFileSize,
      partCodePrefix: instance.partCodePrefix,
      pathHashAlgorithm: instance.pathHashAlgorithm,
      pbkdf2Options: instance.pbkdf2Options,
      secret,
      secretAuthTag,
      secretIvSize: instance.secretIvSize,
      secretKeySize: instance.secretKeySize,
      secretNonce,
    }
  }

  protected override async deserialize(data: Data): Promise<Instance> {
    const cipher = this.#cipher
    const sCryptFilepathSalt = decodeCryptBytes(data.cryptPathSalt)
    const sCryptFilepathSaltAuthTag = decodeAuthTag(data.cryptPathSaltAuthTag)
    const sSecretNonce = decodeCryptBytes(data.secretNonce)

    const CRYPT_PATH_SALT_AUTH_TAG = sCryptFilepathSaltAuthTag
    const CRYPT_PATH_SALT = cipher.decrypt(sCryptFilepathSalt, {
      authTag: CRYPT_PATH_SALT_AUTH_TAG,
    })
    const secretNonce = cipher.decrypt(sSecretNonce)
    const secret = decodeCryptBytes(data.secret) // pre-encrypted.
    const secretAuthTag = decodeAuthTag(data.secretAuthTag) // pre-encrypted.

    return {
      catalogConfigPath: pathResolver.safeResolve(this.#cryptRootDir, data.catalogConfigPath),
      contentHashAlgorithm: data.contentHashAlgorithm,
      cryptPathSalt: bytes2text(CRYPT_PATH_SALT, 'utf8'),
      cryptFilesDir: pathResolver.safeRelative(this.#cryptRootDir, data.cryptFilesDir, true),
      integrityPatterns: data.integrityPatterns,
      keepPlainPatterns: data.keepPlainPatterns,
      mainIvSize: data.mainIvSize,
      mainKeySize: data.mainKeySize,
      maxCryptFileSize:
        (data.maxCryptFileSize ?? Number.POSITIVE_INFINITY) > Number.MAX_SAFE_INTEGER
          ? Number.POSITIVE_INFINITY
          : data.maxCryptFileSize,
      partCodePrefix: data.partCodePrefix,
      pathHashAlgorithm: data.pathHashAlgorithm,
      pbkdf2Options: data.pbkdf2Options,
      secret,
      secretAuthTag,
      secretIvSize: data.secretIvSize,
      secretKeySize: data.secretKeySize,
      secretNonce,
    }
  }
}
