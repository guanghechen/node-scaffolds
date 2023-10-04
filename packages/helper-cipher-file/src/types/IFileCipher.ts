import type { ICipher, IDecipherOptions, IEncryptResult } from '@guanghechen/cipher'

export interface IFileCipher {
  readonly cipher: ICipher

  /**
   * Encrypt plain data from plain files.
   */
  encryptFromFiles(plainFilepaths: string[]): Promise<IEncryptResult>

  /**
   * Decrypt cipher data from ciphered files.
   */
  decryptFromFiles(cryptFilepaths: string[], options?: IDecipherOptions): Promise<Buffer>

  /**
   * Encrypt contents from plainFilepath, and save into cryptFilepath.
   */
  encryptFile(
    plainFilepath: string,
    cryptFilepath: string,
  ): Promise<Omit<IEncryptResult, 'cryptBytes'>>

  /**
   * Decrypt contents from cryptFilepath, and save into plainFilepath.
   */
  decryptFile(
    cryptFilepath: string,
    plainFilepath: string,
    options?: IDecipherOptions,
  ): Promise<void>

  /**
   * Encrypt multiple plain files into a single ciphered file.
   */
  encryptFiles(
    plainFilepaths: string[],
    cryptFilepath: string,
  ): Promise<Omit<IEncryptResult, 'cryptBytes'>>

  /**
   * Decrypt multiple ciphered files into a single plain file.
   */
  decryptFiles(
    cryptFilepaths: string[],
    plainFilepath: string,
    options?: IDecipherOptions,
  ): Promise<void>
}
