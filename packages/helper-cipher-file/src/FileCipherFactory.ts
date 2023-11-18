import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import type { IReporter } from '@guanghechen/reporter.types'
import { FileCipher } from './FileCipher'
import type { IFileCipher } from './types/IFileCipher'
import type { ICreateFileCipherOptions, IFileCipherFactory } from './types/IFileCipherFactory'

export interface IFileCipherFactoryProps {
  readonly cipherFactory: ICipherFactory
  readonly reporter?: IReporter
}

export class FileCipherFactory implements IFileCipherFactory {
  public readonly cipherFactory: ICipherFactory
  protected readonly reporter: IReporter | undefined
  #cipher: ICipher | undefined
  #fileCipher: IFileCipher | undefined

  constructor(props: IFileCipherFactoryProps) {
    this.cipherFactory = props.cipherFactory
    this.reporter = props.reporter
    this.#cipher = undefined
    this.#fileCipher = undefined
  }

  public fileCipher(options: ICreateFileCipherOptions = { iv: undefined }): IFileCipher {
    const cipher = this.cipherFactory.cipher({ iv: options.iv })
    if (!options.iv) this.#cipher = cipher

    if (cipher === this.#cipher && this.#fileCipher !== undefined) return this.#fileCipher

    const fileCipher: IFileCipher = new FileCipher({ cipher, reporter: this.reporter })
    if (cipher === this.#cipher) this.#fileCipher = fileCipher
    return fileCipher
  }
}
