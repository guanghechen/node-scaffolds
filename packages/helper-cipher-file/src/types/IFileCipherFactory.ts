import type { ICipherFactory } from '@guanghechen/cipher'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IFileCipher } from './IFileCipher'

export interface ICreateFileCipherOptions {
  readonly iv: Readonly<Uint8Array> | undefined
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export interface IFileCipherFactory {
  readonly cipherFactory: ICipherFactory
  /**
   * Create new file cipher.
   */
  fileCipher(options: ICreateFileCipherOptions): IFileCipher
}
