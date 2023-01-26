import invariant from '@guanghechen/invariant'
import crypto from 'node:crypto'
import type { ICipher } from '../../types/ICipher'
import { destroyBuffer } from '../../util'
import { BaseCipher } from '../BaseCipher'

export interface IAesCipherProps {
  readonly iv: Buffer
  readonly key: Buffer
  readonly algorithm: crypto.CipherGCMTypes
}

export class AesCipher extends BaseCipher implements ICipher {
  protected readonly algorithm: crypto.CipherGCMTypes
  protected readonly iv: Buffer
  protected readonly key: Buffer

  constructor(options: IAesCipherProps) {
    super()
    this.algorithm = options.algorithm
    this.key = options.key
    this.iv = options.iv
  }

  public override encipher(): crypto.Cipher {
    const { algorithm, key, iv } = this
    invariant(
      this.alive,
      '[AesCipher] cannot call `.encipher()` cause the iv and key have been destroyed.',
    )

    const encipher = crypto.createCipheriv(algorithm, key, iv)
    return encipher
  }

  public override decipher(): crypto.Cipher {
    const { algorithm, key, iv } = this
    invariant(
      this.alive,
      '[AesCipher] cannot call `.decipher()` cause the iv and key have been destroyed.',
    )

    const decipher = crypto.createCipheriv(algorithm, key, iv)
    return decipher
  }

  public override cleanup(): void {
    if (this.alive) {
      destroyBuffer(this.iv)
      destroyBuffer(this.key)
      super.cleanup()
    }
  }
}
