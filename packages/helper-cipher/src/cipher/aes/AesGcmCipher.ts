import { destroyBuffer } from '@guanghechen/helper-buffer'
import invariant from '@guanghechen/invariant'
import type { CipherGCM, CipherGCMTypes } from 'node:crypto'
import { createCipheriv, createDecipheriv } from 'node:crypto'
import type { ICipher, IDecipher, IDecipherOptions, IEncipher } from '../../types/ICipher'
import { BaseCipher } from '../BaseCipher'

export interface IAesGcmCipherProps {
  readonly key: Readonly<Buffer>
  readonly iv: Readonly<Buffer>
}

export class AesGcmCipher extends BaseCipher implements ICipher {
  readonly #algorithm: CipherGCMTypes = 'aes-256-gcm'
  readonly #key: Readonly<Buffer>
  readonly #iv: Readonly<Buffer>

  constructor(options: IAesGcmCipherProps) {
    super()
    this.#key = Buffer.from(options.key) // Deep clone.
    this.#iv = Buffer.from(options.iv) // Deep clone.
  }

  public override encipher(): IEncipher {
    invariant(
      this.alive,
      '[AesCipher] cannot call `.encipher()` cause the iv and key have been destroyed.',
    )

    const encipher: CipherGCM = createCipheriv(this.#algorithm, this.#key, this.#iv)
    return encipher
  }

  public override decipher(options: IDecipherOptions = { authTag: undefined }): IDecipher {
    invariant(
      this.alive,
      '[AesCipher] cannot call `.decipher()` cause the iv and key have been destroyed.',
    )

    if (options.authTag) {
      const decipher = createDecipheriv(this.#algorithm, this.#key, this.#iv)
      decipher.setAuthTag(options.authTag)
      return decipher
    } else {
      const decipher = createCipheriv(this.#algorithm, this.#key, this.#iv)
      return decipher
    }
  }

  public override destroy(): void {
    if (this.alive) {
      destroyBuffer(this.#key)
      super.destroy()
    }
  }
}
