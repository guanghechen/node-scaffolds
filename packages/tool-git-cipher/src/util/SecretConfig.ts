import type { IPBKDF2Options } from '@guanghechen/helper-cipher'
import type { IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/helper-config'
import { PlainJsonConfigKeeper } from '@guanghechen/helper-config'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'

export interface ISecretConfigData {
  /**
   * The path of catalog file of crypt repo. (relative of cryptRootDir)
   */
  readonly catalogFilepath: string
  /**
   * Hash algorithm for generate MAC for content.
   */
  readonly contentHashAlgorithm: IHashAlgorithm
  /**
   * Salt for generate encrypted file path. (utf8 string)
   */
  readonly cryptFilepathSalt: string
  /**
   * The path of not-plain files located. (relative of cryptRootDir)
   */
  readonly cryptFilesDir: string
  /**
   * Glob patterns indicated which files should be keepPlain.
   */
  readonly keepPlainPatterns: string[]
  /**
   * IV size of main cipherFactory.
   */
  readonly mainIvSize: number
  /**
   * Key size of main cipherFactory.
   */
  readonly mainKeySize: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize: number | undefined
  /**
   * Prefix of splitted files parts code.
   */
  readonly partCodePrefix: string
  /**
   * Hash algorithm for generate MAC for filepath.
   */
  readonly pathHashAlgorithm: IHashAlgorithm
  /**
   * Options for PBKDF2 algorithm.
   */
  readonly pbkdf2Options: IPBKDF2Options
  /**
   * Secret of sub cipherFactory (hex string).
   */
  readonly secret: string
  /**
   * Auth tag of secret.
   */
  readonly secretAuthTag: string | undefined
  /**
   * IV size of the secret cipherFactory.
   */
  readonly secretIvSize: number
  /**
   * Key size of the secret cipherFactory.
   */
  readonly secretKeySize: number
  /**
   * Initial nonce for generating ivs of each file in a commit.
   */
  readonly secretNonce: string | undefined
}

export interface ISecretConfigKeeperProps extends IJsonConfigKeeperProps {
  cryptRootDir: string
}

export class SecretConfigKeeper
  extends PlainJsonConfigKeeper<ISecretConfigData>
  implements IConfigKeeper<ISecretConfigData>
{
  public override readonly __version__: string = '1.0.1'
  public override readonly __compatible_version__: string = '^1.0.0'
  public readonly cryptRootDir: string

  constructor(props: ISecretConfigKeeperProps) {
    super(props)
    this.cryptRootDir = props.cryptRootDir
  }

  protected override serialize(data: ISecretConfigData): ISecretConfigData {
    return {
      catalogFilepath: relativeOfWorkspace(this.cryptRootDir, data.catalogFilepath),
      contentHashAlgorithm: data.contentHashAlgorithm ?? 'sha256',
      cryptFilepathSalt: data.cryptFilepathSalt,
      cryptFilesDir: relativeOfWorkspace(this.cryptRootDir, data.cryptFilesDir),
      keepPlainPatterns: data.keepPlainPatterns,
      mainIvSize: data.mainIvSize,
      mainKeySize: data.mainKeySize,
      maxTargetFileSize:
        (data.maxTargetFileSize ?? Number.POSITIVE_INFINITY) > Number.MAX_SAFE_INTEGER
          ? undefined
          : data.maxTargetFileSize,
      partCodePrefix: data.partCodePrefix,
      pathHashAlgorithm: data.pathHashAlgorithm ?? 'sha256',
      pbkdf2Options: data.pbkdf2Options,
      secret: data.secret,
      secretAuthTag: data.secretAuthTag,
      secretIvSize: data.secretIvSize,
      secretKeySize: data.secretKeySize,
      secretNonce: data.secretNonce,
    }
  }

  protected override deserialize(data: ISecretConfigData): ISecretConfigData {
    return {
      catalogFilepath: absoluteOfWorkspace(this.cryptRootDir, data.catalogFilepath),
      contentHashAlgorithm: data.contentHashAlgorithm,
      cryptFilepathSalt: data.cryptFilepathSalt,
      cryptFilesDir: relativeOfWorkspace(this.cryptRootDir, data.cryptFilesDir),
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
      secret: data.secret,
      secretAuthTag: data.secretAuthTag,
      secretIvSize: data.secretIvSize,
      secretKeySize: data.secretKeySize,
      secretNonce: data.secretNonce,
    }
  }
}
