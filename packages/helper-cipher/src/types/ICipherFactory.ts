import type { BinaryLike } from 'node:crypto'
import type { ICipher } from './ICipher'

export interface IPBKDF2Options {
  salt: BinaryLike
  iterations: number
  keylen: number
  digest: 'sha256'
}

export interface ICipherFactory {
  /**
   * Create a secret with key
   */
  createRandomSecret(): Buffer

  /**
   * Load key of cipher from secret
   * @param secret
   */
  initFromSecret(secret: Readonly<Buffer>): ICipher | never

  /**
   * Load key of cipher from password
   * @param password
   */
  initFromPassword(password: Readonly<Buffer>, options: IPBKDF2Options): ICipher | never
}
