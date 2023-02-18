import { destroyBuffer } from '@guanghechen/helper-buffer'
import { calcMac } from '@guanghechen/helper-mac'
import invariant from '@guanghechen/invariant'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import type { ICipher } from '../../types/ICipher'
import type { ICipherFactory, ICipherOptions, IPBKDF2Options } from '../../types/ICipherFactory'
import { AesGcmCipher } from './AesGcmCipher'

export interface IAesGcmCipherFactoryProps {
  /**
   * @default 32
   */
  ivSize?: number
  /**
   * @default 12
   */
  keySize?: number
}

export class AesGcmCipherFactory implements ICipherFactory {
  public readonly keySize: number
  public readonly ivSize: number
  #key: Buffer | null
  #iv: Buffer | null
  #cipher: ICipher | null

  constructor(options: IAesGcmCipherFactoryProps = {}) {
    this.keySize = options.keySize ?? 32
    this.ivSize = options.ivSize ?? 12
    this.#key = null
    this.#iv = null
    this.#cipher = null
  }

  public cipher(options: ICipherOptions = { iv: undefined }): ICipher {
    invariant(
      !!this.#key && !!this.#iv,
      '[AesCipherFactory] cannot call `.cipher()` cause the iv and key have been destroyed.',
    )

    const iv: Buffer = options.iv ?? this.#iv
    if (iv === this.#iv && this.#cipher !== null) return this.#cipher

    const cipher: ICipher = new AesGcmCipher({ key: this.#key, iv })
    if (iv === this.#iv) this.#cipher = cipher
    return cipher
  }

  public createRandomIv(): Readonly<Buffer> {
    return randomBytes(this.ivSize)
  }

  public createRandomSecret(): Buffer {
    return randomBytes(this.keySize + this.ivSize)
  }

  public initFromSecret(secret: Readonly<Buffer>): void {
    const { key, iv } = this._parseSecret(secret)
    this.cleanup()
    this.#key = key
    this.#iv = iv
  }

  public initFromPassword(password: Readonly<Buffer>, options: IPBKDF2Options): void {
    const { key, iv } = this._parsePassword(password, options)
    this.cleanup()
    this.#key = key
    this.#iv = iv
  }

  public cleanup(): void {
    destroyBuffer(this.#key)
    destroyBuffer(this.#iv)
    this.#iv = null
    this.#key = null
    this.#cipher = null
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
