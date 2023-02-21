import { destroyBuffer } from '@guanghechen/helper-buffer'
import { calcMac } from '@guanghechen/helper-mac'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import type { ICipherFactory } from '../../types/ICipherFactory'
import type { ICipherFactoryBuilder, IPBKDF2Options } from '../../types/ICipherFactoryBuilder'
import { AesGcmCipherFactory } from './AesGcmCipherFactory'

export interface IAesGcmCipherFactoryBuilderProps {
  /**
   * @default 32
   */
  ivSize?: number
  /**
   * @default 12
   */
  keySize?: number
}

export class AesGcmCipherFactoryBuilder implements ICipherFactoryBuilder {
  public readonly keySize: number
  public readonly ivSize: number

  constructor(options: IAesGcmCipherFactoryBuilderProps = {}) {
    this.keySize = options.keySize ?? 32
    this.ivSize = options.ivSize ?? 12
  }

  public createRandomIv(): Readonly<Buffer> {
    return randomBytes(this.ivSize)
  }

  public createRandomSecret(): Buffer {
    return randomBytes(this.keySize + this.ivSize)
  }

  public buildFromSecret(secret: Readonly<Buffer>): ICipherFactory {
    const { key, iv } = this._parseSecret(secret)
    return this._build(key, iv)
  }

  public buildFromPassword(password: Readonly<Buffer>, options: IPBKDF2Options): ICipherFactory {
    const { key, iv } = this._parsePassword(password, options)
    return this._build(key, iv)
  }

  protected _build(key: Buffer, iv: Buffer): ICipherFactory {
    const factory = new AesGcmCipherFactory({ key, iv })
    destroyBuffer(key)
    destroyBuffer(iv)
    return factory
  }

  protected _parseSecret(secret: Readonly<Buffer>): { key: Buffer; iv: Buffer } {
    const { keySize: _keySize, ivSize: _ivSize } = this
    const key: Buffer = Buffer.alloc(_keySize)
    const iv: Buffer = Buffer.alloc(_ivSize)
    secret.copy(key, 0, 0, _keySize)
    secret.copy(iv, 0, _keySize, _keySize + _ivSize)
    return { key, iv }
  }

  protected _parsePassword(
    password: Readonly<Buffer>,
    options: IPBKDF2Options,
  ): { key: Buffer; iv: Buffer } {
    const { keySize: _keySize, ivSize: _ivSize } = this
    const { salt, iterations, digest } = options
    const key: Buffer = pbkdf2Sync(password, salt, iterations, _keySize, digest)

    const ivPassword = calcMac([password, Buffer.from(salt, 'utf8'), key], digest)
    const iv: Buffer = pbkdf2Sync(ivPassword, salt, iterations + 137, _ivSize, digest)
    return { key, iv }
  }
}
