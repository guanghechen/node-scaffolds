/**
 * Shape of a cipher.
 */
export interface CipherHelper {
  /**
   * Encrypt plain data
   */
  encrypt(plainData: Readonly<Buffer>): Buffer

  /**
   * Decrypt cipher data
   */
  decrypt(cipherData: Readonly<Buffer>): Buffer

  /**
   * Encrypt plain data from plain files.
   */
  encryptFromFiles(plainFilepaths: string[]): Promise<Buffer>

  /**
   * Decrypt cipher data from ciphered files.
   */
  decryptFromFiles(cipherFilepaths: string[]): Promise<Buffer>

  /**
   * Encrypt contents from plainFilepath, and save into cipherFilepath.
   */
  encryptFile(plainFilepath: string, cipherFilepath: string): Promise<void>

  /**
   * Decrypt contents from cipherFilepath, and save into plainFilepath.
   */
  decryptFile(cipherFilepath: string, plainFilepath: string): Promise<void>

  /**
   * Encrypt multiple plain files into a single ciphered file.
   */
  encryptFiles(plainFilepaths: string[], cipherFilepath: string): Promise<void>

  /**
   * Decrypt multiple ciphered files into a single plain file.
   */
  decryptFiles(cipherFilepaths: string[], plainFilepath: string): Promise<void>

  /**
   * Create a secret with key
   */
  createSecret(): Buffer

  /**
   * Load key of cipher from secret
   * @param secret
   */
  initFromSecret(secret: Readonly<Buffer>): void | never

  /**
   * Load key of cipher from password
   * @param password
   */
  initFromPassword(password: Readonly<Buffer>): void | never

  /**
   * Destroy secret and sensitive data
   */
  cleanup(): void
}
