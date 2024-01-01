import type { ICipher, IDecipherOptions, IEncryptResult } from '@guanghechen/cipher'

export interface IFileCipher {
  readonly cipher: ICipher

  /**
   * Encrypt plain data from plain files.
   */
  encryptFromFiles(plainPaths: string[]): Promise<IEncryptResult>

  /**
   * Decrypt cipher data from ciphered files.
   */
  decryptFromFiles(cryptPaths: string[], options?: IDecipherOptions): Promise<Uint8Array>

  /**
   * Encrypt contents from plainFilepath, and save into cryptFilepath.
   */
  encryptFile(plainPath: string, cryptPath: string): Promise<Omit<IEncryptResult, 'cryptBytes'>>

  /**
   * Decrypt contents from cryptFilepath, and save into plainFilepath.
   */
  decryptFile(cryptPath: string, plainPath: string, options?: IDecipherOptions): Promise<void>

  /**
   * Encrypt multiple plain files into a single ciphered file.
   */
  encryptFiles(plainPaths: string[], cryptPath: string): Promise<Omit<IEncryptResult, 'cryptBytes'>>

  /**
   * Decrypt multiple ciphered files into a single plain file.
   */
  decryptFiles(cryptPaths: string[], plainPath: string, options?: IDecipherOptions): Promise<void>
}
