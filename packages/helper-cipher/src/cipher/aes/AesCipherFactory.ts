import crypto from 'node:crypto'
import type { ICipher } from '../../types/ICipher'
import type { ICipherFactory, IPBKDF2Options } from '../../types/ICipherFactory'
import { destroyBuffer } from '../../util'
import { AesCipher } from './AesCipher'

export interface IAesCipherFactoryProps {
  /**
   * @default 32
   */
  ivSize?: number
  /**
   * @default 32
   */
  keySize?: number
  /**
   * @default 'aes-256-gcm'
   */
  algorithm?: crypto.CipherGCMTypes
}

export class AesCipherFactory implements ICipherFactory {
  protected readonly ivSize: number
  protected readonly keySize: number
  protected readonly algorithm: crypto.CipherGCMTypes

  constructor(options: IAesCipherFactoryProps = {}) {
    this.ivSize = options.ivSize ?? 32
    this.keySize = options.keySize ?? 32
    this.algorithm = options.algorithm ?? 'aes-256-gcm'
  }

  public createRandomSecret(): Buffer {
    const { ivSize, keySize } = this
    const iv: Buffer = crypto.randomBytes(ivSize)
    const key: Buffer = crypto.randomBytes(keySize)
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

  public initFromSecret(secret: Readonly<Buffer>): ICipher | never {
    const { iv, key } = this._parseSecret(secret)
    return new AesCipher({ iv, key, algorithm: this.algorithm })
  }

  public initFromPassword(password: Readonly<Buffer>, options: IPBKDF2Options): ICipher | never {
    const { iv, key } = this._parsePassword(password, options)
    return new AesCipher({ iv, key, algorithm: this.algorithm })
  }

  protected _parseSecret(secret: Readonly<Buffer>): { iv: Buffer; key: Buffer } {
    const { ivSize, keySize } = this
    const iv: Buffer = Buffer.alloc(ivSize)
    const key: Buffer = Buffer.alloc(keySize)
    secret.copy(iv, 0, 0, ivSize)
    secret.copy(key, 0, ivSize, ivSize + keySize)
    return { iv, key }
  }

  protected _parsePassword(
    password: Readonly<Buffer>,
    options: IPBKDF2Options,
  ): { iv: Buffer; key: Buffer } {
    const master = crypto.pbkdf2Sync(
      password,
      options.salt,
      options.iterations,
      options.keylen,
      options.digest,
    )

    const keyHmac = crypto.createHmac('sha256', master)
    keyHmac.update('key')
    const key = keyHmac.digest()

    const ivHmac = crypto.createHmac('sha256', master)
    ivHmac.update('iv')
    const iv = ivHmac.digest()
    return { iv, key }
  }
}
