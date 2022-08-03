import type ChalkLogger from '@guanghechen/chalk-logger'
import invariant from '@guanghechen/invariant'
import type { Cipher } from 'crypto'
import crypto from 'crypto'
import { BaseCipher } from './BaseCipher'
import type { ICipher } from './types/cipher'
import { destroyBuffer } from './util/buffer'
import { createRandomIv, createRandomKey } from './util/key'

export interface IAESCipherOptions {
  /**
   *
   */
  logger?: ChalkLogger
  /**
   * @default 'aes-256-gcm'
   */
  algorithm?: crypto.CipherGCMTypes
  /**
   *
   */
  iv?: Buffer
  /**
   *
   */
  key?: Buffer
}

export class AESCipher extends BaseCipher implements ICipher {
  protected readonly ivSize = 32
  protected readonly keySize = 32
  protected readonly algorithm: crypto.CipherGCMTypes
  protected iv: Buffer | null
  protected key: Buffer | null

  constructor(options: IAESCipherOptions = {}) {
    super(options.logger)
    this.algorithm = options.algorithm ?? 'aes-256-gcm'
    this.key = options.key || null
    this.iv = options.iv || null
  }

  public override createSecret(): Buffer {
    const { ivSize, keySize } = this
    const iv: Buffer = createRandomIv(ivSize)
    const key: Buffer = createRandomKey(keySize)
    const secret: Buffer = Buffer.alloc(iv.length + key.length)

    {
      let s = 0
      iv.copy(secret, s, 0, iv.length)
      destroyBuffer(iv)

      s += iv.length
      key.copy(secret, s, 0, key.length)
      destroyBuffer(key)
    }

    return secret
  }

  public override initFromSecret(secret: Readonly<Buffer>): void | never {
    const { ivSize, keySize } = this
    const iv: Buffer = Buffer.alloc(ivSize)
    const key: Buffer = Buffer.alloc(keySize)
    secret.copy(iv, 0, 0, ivSize)
    secret.copy(key, 0, ivSize, ivSize + keySize)

    this.cleanup()
    this.iv = iv
    this.key = key
  }

  public override initFromPassword(password: Readonly<Buffer>): void | never {
    const { ivSize, keySize } = this
    const iv: Buffer = Buffer.alloc(ivSize)
    const key: Buffer = Buffer.alloc(keySize)
    let j = 0

    // generate iv
    for (let i = 0; i < ivSize; ++i) {
      iv[i] = password[j]
      j = (j + 1) % password.length
    }

    // generate key
    for (let i = 0; i < keySize; ++i) {
      key[i] = password[j]
      j = (j + 1) % password.length
    }

    this.cleanup()
    this.iv = iv
    this.key = key
  }

  protected override encipher(): Cipher {
    const { algorithm, key, iv } = this
    invariant(key != null && iv != null, 'NULL_POINTER_ERROR: iv / key is null')

    const encipher = crypto.createCipheriv(algorithm, key, iv)
    return encipher
  }

  public override decipher(): Cipher {
    const { algorithm, key, iv } = this
    invariant(key != null && iv != null, 'NULL_POINTER_ERROR: iv / key is null')

    const decipher = crypto.createCipheriv(algorithm, key, iv)
    return decipher
  }

  public override cleanup(): void {
    destroyBuffer(this.iv)
    destroyBuffer(this.key)
    this.iv = null
    this.key = null
  }
}
