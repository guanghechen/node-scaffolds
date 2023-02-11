import type { ICipher } from './ICipher'

export interface IPBKDF2Options {
  salt: string
  iterations: number
  digest: 'sha256'
}

export interface ICipherOptions {
  iv: Buffer | undefined
}

export interface ICipherFactory {
  /**
   * Create a ICipher.
   * @param options
   */
  cipher(options?: ICipherOptions): ICipher

  /**
   * Create a random initial vector.
   */
  createRandomIv(): Buffer

  /**
   * Create a random secret.
   */
  createRandomSecret(): Buffer

  /**
   * Load key/iv of cipher from secret.
   * @param secret
   */
  initFromSecret(secret: Readonly<Buffer>): void

  /**
   * Load key/iv of cipher from password.
   * @param password
   */
  initFromPassword(password: Readonly<Buffer>, options: IPBKDF2Options): void

  /**
   * Destroy secret and sensitive data.
   */
  cleanup(): void
}
