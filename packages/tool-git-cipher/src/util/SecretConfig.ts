import type { ICipher } from '@guanghechen/cipher'
import { FileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/helper-config'
import { JsonConfigKeeper, PlainJsonConfigKeeper } from '@guanghechen/helper-config'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'
import type { PromiseOr } from '@guanghechen/utility-types'
import micromatch from 'micromatch'
import type { ISecretConfig, ISecretConfigData } from './SecretConfig.types'

type Instance = ISecretConfig
type Data = ISecretConfigData

export const encodeCryptBytes = (key: Buffer): string => key.toString('hex')
export const decodeCryptBytes = (key: string): Buffer => Buffer.from(key, 'hex')

export const encodeAuthTag = (authTag: Buffer | undefined): string | undefined =>
  authTag?.toString('hex')
export const decodeAuthTag = (authTag: string | undefined): Buffer | undefined =>
  typeof authTag === 'string' ? Buffer.from(authTag, 'hex') : undefined

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

  public createCatalogContext(): FileCipherCatalogContext | undefined {
    if (this.data) {
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

    const eCryptFilepathSalt = cipher.encrypt(Buffer.from(instance.cryptFilepathSalt, 'utf8'))
    const eSecretNonce = cipher.encrypt(instance.secretNonce)
    const eSecretCatalogNonce = cipher.encrypt(instance.secretCatalogNonce)

    const cryptFilepathSalt: string = encodeCryptBytes(eCryptFilepathSalt.cryptBytes)
    const cryptFilepathSaltAuthTag: string | undefined = encodeAuthTag(eCryptFilepathSalt.authTag)
    const secretNonce: string = encodeCryptBytes(eSecretNonce.cryptBytes)
    const secretCatalogNonce: string = encodeCryptBytes(eSecretCatalogNonce.cryptBytes)

    const secret: string = encodeCryptBytes(instance.secret) // pre-encrypted
    const secretAuthTag: string | undefined = encodeAuthTag(instance.secretAuthTag) // pre-encrypted

    return {
      catalogFilepath: relativeOfWorkspace(this.#cryptRootDir, instance.catalogFilepath),
      contentHashAlgorithm: instance.contentHashAlgorithm,
      cryptFilepathSalt,
      cryptFilepathSaltAuthTag,
      cryptFilesDir: relativeOfWorkspace(this.#cryptRootDir, instance.cryptFilesDir),
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
      catalogFilepath: absoluteOfWorkspace(this.#cryptRootDir, data.catalogFilepath),
      contentHashAlgorithm: data.contentHashAlgorithm,
      cryptFilepathSalt: cryptFilepathSalt.toString('utf8'),
      cryptFilesDir: relativeOfWorkspace(this.#cryptRootDir, data.cryptFilesDir),
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
