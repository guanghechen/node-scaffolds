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

  public fileCipher(options: ICreateFileCipherOptions): IFileCipher {
    const { iv, cryptPathResolver, plainPathResolver } = options
    const cipher = this.cipherFactory.cipher({ iv })
    if (!iv) this.#cipher = cipher
    if (cipher === this.#cipher && this.#fileCipher !== undefined) return this.#fileCipher

    const { reporter } = this
    const fileCipher: IFileCipher = new FileCipher({
      cipher,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    if (cipher === this.#cipher) this.#fileCipher = fileCipher
    return fileCipher
  }
}
