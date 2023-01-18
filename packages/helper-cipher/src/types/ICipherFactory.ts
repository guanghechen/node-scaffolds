import type { ICipher } from './ICipher'

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
  createRandomSecret(): Buffer
}
