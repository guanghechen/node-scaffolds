import type { Cipher } from 'node:crypto'

export interface ICipher {
  /**
   * Check if this instance available.
   */
  readonly alive: boolean

  /**
   * Construct an encipher.
   */
  encipher(): Cipher

  /**
   * Construct a decipher.
   */
  decipher(): Cipher

  /**
   * Encrypt plain data.
   */
  encrypt(plainData: Readonly<Buffer>): Buffer

  /**
   * Decrypt cipher data.
   */
  decrypt(cipherData: Readonly<Buffer>): Buffer

  /**
   * Encrypt plain json data.
   * @param plainData
   */
  encryptJson(plainData: unknown): Buffer

  /**
   * Decrypt plain json data.
   * @param plainData
   */
  decryptJson(cipherData: Readonly<Buffer>): unknown

  /**
   * Destroy secret and sensitive data.
   */
  cleanup(): void
}
