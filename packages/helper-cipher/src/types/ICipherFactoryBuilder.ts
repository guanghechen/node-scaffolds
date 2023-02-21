import type { ICipherFactory } from './ICipherFactory'

export interface IPBKDF2Options {
  salt: string
  iterations: number
  digest: 'sha256'
}

export interface ICipherFactoryBuilder {
  readonly keySize: number
  readonly ivSize: number

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
   */
  buildFromSecret(secret: Readonly<Buffer>): ICipherFactory

  /**
   * Load key/iv of cipher from password.
   */
  buildFromPassword(password: Readonly<Buffer>, options: IPBKDF2Options): ICipherFactory
}
