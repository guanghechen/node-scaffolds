import { bytes2text, text2bytes } from '@guanghechen/byte'
import type { ICipher } from '@guanghechen/cipher'
import { FileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/helper-config'
import { JsonConfigKeeper, PlainJsonConfigKeeper } from '@guanghechen/helper-config'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import { pathResolver } from '@guanghechen/path'
import type { PromiseOr } from '@guanghechen/utility-types'
import micromatch from 'micromatch'
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
const __version__ = '2.0.0'
const __compatible_version__ = '~2.0.0'

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
    cryptPathResolver: IWorkspacePathResolver
    plainPathResolver: IWorkspacePathResolver
  }): FileCipherCatalogContext | undefined {
    if (this.data) {
      const { cryptPathResolver, plainPathResolver } = params
      const {
        contentHashAlgorithm,
        cryptFilepathSalt,
        cryptFilesDir,
        keepPlainPatterns,
        maxTargetFileSize = Number.POSITIVE_INFINITY,
        partCodePrefix,
        pathHashAlgorithm,
      } = this.data
      const catalogContext = new FileCipherCatalogContext({
        contentHashAlgorithm,
        cryptFilepathSalt,
        cryptFilesDir,
        maxTargetFileSize,
        partCodePrefix,
        pathHashAlgorithm,
        plainPathResolver,
        cryptPathResolver,
        isKeepPlain:
          keepPlainPatterns.length > 0
            ? sourceFile => micromatch.isMatch(sourceFile, keepPlainPatterns, { dot: true })
            : () => false,
      })
      return catalogContext
    }
    return undefined
  }

  protected override serialize(instance: Instance): PromiseOr<Data> {
    const cipher = this.#cipher

    const eCryptFilepathSalt = cipher.encrypt(text2bytes(instance.cryptFilepathSalt, 'utf8'))
    const eSecretNonce = cipher.encrypt(instance.secretNonce)
    const eSecretCatalogNonce = cipher.encrypt(instance.secretCatalogNonce)

    const cryptFilepathSalt: string = encodeCryptBytes(eCryptFilepathSalt.cryptBytes)
    const cryptFilepathSaltAuthTag: string | undefined = encodeAuthTag(eCryptFilepathSalt.authTag)
    const secretNonce: string = encodeCryptBytes(eSecretNonce.cryptBytes)
    const secretCatalogNonce: string = encodeCryptBytes(eSecretCatalogNonce.cryptBytes)

    const secret: string = encodeCryptBytes(instance.secret) // pre-encrypted
    const secretAuthTag: string | undefined = encodeAuthTag(instance.secretAuthTag) // pre-encrypted

    return {
      catalogFilepath: pathResolver.safeRelative(
        this.#cryptRootDir,
        instance.catalogFilepath,
        true,
      ),
      contentHashAlgorithm: instance.contentHashAlgorithm,
      cryptFilepathSalt,
      cryptFilepathSaltAuthTag,
      cryptFilesDir: pathResolver.safeRelative(this.#cryptRootDir, instance.cryptFilesDir, true),
      keepPlainPatterns: instance.keepPlainPatterns,
      mainIvSize: instance.mainIvSize,
      mainKeySize: instance.mainKeySize,
      maxTargetFileSize:
        (instance.maxTargetFileSize ?? Number.POSITIVE_INFINITY) > Number.MAX_SAFE_INTEGER
          ? undefined
          : instance.maxTargetFileSize,
      partCodePrefix: instance.partCodePrefix,
      pathHashAlgorithm: instance.pathHashAlgorithm,
      pbkdf2Options: instance.pbkdf2Options,
      secret,
      secretAuthTag,
      secretIvSize: instance.secretIvSize,
      secretKeySize: instance.secretKeySize,
      secretNonce,
      secretCatalogNonce,
    }
  }

  protected override deserialize(data: Data): Instance {
    const cipher = this.#cipher

    const sCryptFilepathSalt = decodeCryptBytes(data.cryptFilepathSalt)
    const sCryptFilepathSaltAuthTag = decodeAuthTag(data.cryptFilepathSaltAuthTag)
    const sSecretNonce = decodeCryptBytes(data.secretNonce)
    const sSecretCatalogNonce = decodeCryptBytes(data.secretCatalogNonce)

    const cryptFilepathSaltAuthTag = sCryptFilepathSaltAuthTag
    const cryptFilepathSalt = cipher.decrypt(sCryptFilepathSalt, {
      authTag: cryptFilepathSaltAuthTag,
    })
    const secretNonce = cipher.decrypt(sSecretNonce)
    const secretCatalogNonce = cipher.decrypt(sSecretCatalogNonce)

    const secret = decodeCryptBytes(data.secret) // pre-encrypted.
    const secretAuthTag = decodeAuthTag(data.secretAuthTag) // pre-encrypted.

    return {
      catalogFilepath: pathResolver.safeResolve(this.#cryptRootDir, data.catalogFilepath),
      contentHashAlgorithm: data.contentHashAlgorithm,
      cryptFilepathSalt: bytes2text(cryptFilepathSalt, 'utf8'),
      cryptFilesDir: pathResolver.safeRelative(this.#cryptRootDir, data.cryptFilesDir, true),
      keepPlainPatterns: data.keepPlainPatterns,
      mainIvSize: data.mainIvSize,
      mainKeySize: data.mainKeySize,
      maxTargetFileSize:
        (data.maxTargetFileSize ?? Number.POSITIVE_INFINITY) > Number.MAX_SAFE_INTEGER
          ? Number.POSITIVE_INFINITY
          : data.maxTargetFileSize,
      partCodePrefix: data.partCodePrefix,
      pathHashAlgorithm: data.pathHashAlgorithm,
      pbkdf2Options: data.pbkdf2Options,
      secret,
      secretAuthTag,
      secretIvSize: data.secretIvSize,
      secretKeySize: data.secretKeySize,
      secretNonce,
      secretCatalogNonce,
    }
  }
}
