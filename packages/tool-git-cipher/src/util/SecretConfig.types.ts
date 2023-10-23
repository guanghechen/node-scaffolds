import type { IPBKDF2Options } from '@guanghechen/cipher'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'

export interface ISecretConfig {
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
   * Secret of sub cipherFactory. (hex string)
   */
  readonly secret: Readonly<Uint8Array>
  /**
   * Auth tag of secret. (hex string)
   */
  readonly secretAuthTag: Readonly<Uint8Array> | undefined
  /**
   * IV size of the secret cipherFactory.
   */
  readonly secretIvSize: number
  /**
   * Key size of the secret cipherFactory.
   */
  readonly secretKeySize: number
  /**
   * Initial nonce for generating ivs of each file in a commit. (hex string)
   */
  readonly secretNonce: Readonly<Uint8Array>
  /**
   * Initial nonce for generating iv for catalog config. (hex string)
   */
  readonly secretCatalogNonce: Readonly<Uint8Array>
}

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
   * Auth tag of cryptFilepathSalt. (hex string)
   */
  readonly cryptFilepathSaltAuthTag: string | undefined
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
   * Secret of sub cipherFactory. (hex string)
   */
  readonly secret: string
  /**
   * Auth tag of secret. (hex string)
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
   * Initial nonce for generating ivs of each file in a commit. (hex string)
   */
  readonly secretNonce: string
  /**
   * Initial nonce for generating iv for catalog config. (hex string)
   */
  readonly secretCatalogNonce: string
}

export type IPresetSecretConfig = Omit<
  ISecretConfig,
  'secret' | 'secretAuthTag' | 'secretNonce' | 'secretCatalogNonce'
>
