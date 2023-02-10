import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import type { ILogger } from '@guanghechen/utility-types'
import { FileCipher } from './FileCipher'
import type { IFileCipher } from './types/IFileCipher'
import type { ICreateFileCipherOptions, IFileCipherFactory } from './types/IFileCipherFactory'

interface IFileCipherFactoryProps {
  readonly cipherFactory: ICipherFactory
  readonly logger?: ILogger
}

/**
 * ICipher base class.
 */
export class FileCipherFactory implements IFileCipherFactory {
  public readonly cipherFactory: ICipherFactory
  protected readonly logger?: ILogger
  #cipher: ICipher | null
  #fileCipher: IFileCipher | null

  constructor(props: IFileCipherFactoryProps) {
    this.cipherFactory = props.cipherFactory
    this.logger = props.logger
    this.#cipher = null
    this.#fileCipher = null
  }

  public fileCipher(options: ICreateFileCipherOptions = { iv: undefined }): IFileCipher {
    const cipher = this.cipherFactory.cipher({ iv: options.iv })
    if (!options.iv) this.#cipher = cipher

    if (cipher === this.#cipher && this.#fileCipher !== null) return this.#fileCipher

    const fileCipher: IFileCipher = new FileCipher({ cipher, logger: this.logger })
    if (cipher === this.#cipher) this.#fileCipher = fileCipher
    return fileCipher
  }
}
