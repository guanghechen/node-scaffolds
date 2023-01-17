import type { Cipher } from 'node:crypto'

export interface ICipher {
  /**
   * Construct an encipher.
   */
  encipher(): Cipher

  /**
   * Construct a decipher.
   */
  decipher(): Cipher

  /**
   * Encrypt plain data
   */
  encrypt(plainData: Readonly<Buffer>): Buffer

  /**
   * Decrypt cipher data
   */
  decrypt(cipherData: Readonly<Buffer>): Buffer

  /**
   * Destroy secret and sensitive data
   */
  cleanup(): void
}

export interface ICipherFactory {
  /**
   * Load key of cipher from secret
   * @param secret
   */
  initFromSecret(secret: Readonly<Buffer>): ICipher | never

  /**
   * Load key of cipher from password
   * @param password
   */
  initFromPassword(password: Readonly<Buffer>): ICipher | never

  /**
   * Create a secret with key
   */
  createSecret(): Buffer
}
