import type { ICipherFactory } from '@guanghechen/cipher'
import type { IFileCipher } from './IFileCipher'

export interface ICreateFileCipherOptions {
  readonly iv: Readonly<Uint8Array> | undefined
}

export interface IFileCipherFactory {
  readonly cipherFactory: ICipherFactory

  /**
   * Create new file cipher.
   */
  fileCipher(options?: ICreateFileCipherOptions): IFileCipher
}
