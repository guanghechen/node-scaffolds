import type { ICipher } from '@guanghechen/helper-cipher'

export interface IFileCipher {
  readonly cipher: ICipher

  /**
   * Encrypt plain data from plain files.
   */
  encryptFromFiles(plainFilepaths: string[]): Promise<Buffer>

  /**
   * Decrypt cipher data from ciphered files.
   */
  decryptFromFiles(cryptFilepaths: string[]): Promise<Buffer>

  /**
   * Encrypt contents from plainFilepath, and save into cryptFilepath.
   */
  encryptFile(plainFilepath: string, cryptFilepath: string): Promise<void>

  /**
   * Decrypt contents from cryptFilepath, and save into plainFilepath.
   */
  decryptFile(cryptFilepath: string, plainFilepath: string): Promise<void>

  /**
   * Encrypt multiple plain files into a single ciphered file.
   */
  encryptFiles(plainFilepaths: string[], cryptFilepath: string): Promise<void>

  /**
   * Decrypt multiple ciphered files into a single plain file.
   */
  decryptFiles(cryptFilepaths: string[], plainFilepath: string): Promise<void>
}
