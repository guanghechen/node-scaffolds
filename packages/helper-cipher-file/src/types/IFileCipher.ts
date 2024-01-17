import type { ICipher, IEncryptResult } from '@guanghechen/cipher'

export interface IFileCipher {
  readonly cipher: ICipher

  /**
   * Encrypt plain data from plain files.
   */
  encryptFromFiles(params: { plainPaths: string[] }): Promise<IEncryptResult>

  /**
   * Decrypt cipher data from ciphered files.
   */
  decryptFromFiles(params: {
    authTag: Readonly<Uint8Array> | undefined
    cryptPaths: string[]
  }): Promise<Uint8Array>

  /**
   * Encrypt contents from plainFilepath, and save into cryptFilepath.
   */
  encryptFile(params: {
    cryptPath: string
    plainPath: string
  }): Promise<Omit<IEncryptResult, 'cryptBytes'>>

  /**
   * Decrypt contents from cryptFilepath, and save into plainFilepath.
   */
  decryptFile(params: {
    authTag: Readonly<Uint8Array> | undefined
    cryptPath: string
    plainPath: string
  }): Promise<void>

  /**
   * Encrypt multiple plain files into a single ciphered file.
   */
  encryptFiles(params: {
    cryptPath: string
    plainPaths: string[]
  }): Promise<Omit<IEncryptResult, 'cryptBytes'>>

  /**
   * Decrypt multiple ciphered files into a single plain file.
   */
  decryptFiles(params: {
    authTag: Readonly<Uint8Array> | undefined
    plainPath: string
    cryptPaths: string[]
  }): Promise<void>
}
