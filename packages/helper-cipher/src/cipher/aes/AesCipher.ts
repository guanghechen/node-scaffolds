import { destroyBuffer } from '@guanghechen/helper-stream'
import invariant from '@guanghechen/invariant'
import crypto from 'crypto'
import type { ICipher } from '../../types/cipher'
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
  protected destroyed: boolean

  constructor(options: IAesCipherProps) {
    super()
    this.algorithm = options.algorithm
    this.key = options.key
    this.iv = options.iv
    this.destroyed = false
  }

  public override encipher(): crypto.Cipher {
    const { algorithm, key, iv } = this
    invariant(
      !this.destroyed,
      '[AesCipher] cannot call .encipher cause the iv and key have been destroyed.',
    )

    const encipher = crypto.createCipheriv(algorithm, key, iv)
    return encipher
  }

  public override decipher(): crypto.Cipher {
    const { algorithm, key, iv } = this
    invariant(
      !this.destroyed,
      '[AesCipher] cannot call .encipher cause the iv and key have been destroyed.',
    )

    const decipher = crypto.createCipheriv(algorithm, key, iv)
    return decipher
  }

  public override cleanup(): void {
    if (!this.destroyed) {
      destroyBuffer(this.iv)
      destroyBuffer(this.key)
      this.destroyed = true
    }
  }
}
