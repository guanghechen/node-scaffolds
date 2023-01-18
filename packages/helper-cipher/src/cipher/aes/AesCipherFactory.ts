import { destroyBuffer } from '@guanghechen/helper-stream'
import type crypto from 'node:crypto'
import type { ICipher } from '../../types/ICipher'
import type { ICipherFactory } from '../../types/ICipherFactory'
import { createRandomIv, createRandomKey } from '../../util/key'
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

  public initFromSecret(secret: Readonly<Buffer>): ICipher | never {
    const { iv, key } = this.parseSecret(secret)
    return new AesCipher({ iv, key, algorithm: this.algorithm })
  }

  public initFromPassword(password: Readonly<Buffer>): ICipher | never {
    const { iv, key } = this.parsePassword(password)
    return new AesCipher({ iv, key, algorithm: this.algorithm })
  }

  protected parseSecret(secret: Readonly<Buffer>): { iv: Buffer; key: Buffer } {
    const { ivSize, keySize } = this
    const iv: Buffer = Buffer.alloc(ivSize)
    const key: Buffer = Buffer.alloc(keySize)
    secret.copy(iv, 0, 0, ivSize)
    secret.copy(key, 0, ivSize, ivSize + keySize)
    return { iv, key }
  }

  protected parsePassword(password: Readonly<Buffer>): { iv: Buffer; key: Buffer } {
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

    return { iv, key }
  }
}
