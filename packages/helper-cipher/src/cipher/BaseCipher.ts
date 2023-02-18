import { destroyBuffers } from '@guanghechen/helper-buffer'
import type {
  ICipher,
  IDecipher,
  IDecipherOptions,
  IEncipher,
  IEncryptResult,
} from '../types/ICipher'

/**
 * ICipher base class.
 */
export abstract class BaseCipher implements ICipher {
  protected _alive: boolean

  constructor() {
    this._alive = true
  }

  public abstract readonly iv: string

  public get alive(): boolean {
    return this._alive
  }

  // override
  public abstract encipher(): IEncipher

  // override
  public abstract decipher(options?: IDecipherOptions): IDecipher

  // override
  public encrypt(plainBytes: Readonly<Buffer>): IEncryptResult {
    const encipher = this.encipher()
    const cipherBytesList: Buffer[] = []

    let cryptBytes: Buffer
    let authTag: Buffer | undefined
    try {
      // Collect and encrypt data
      cipherBytesList.push(encipher.update(plainBytes))
      cipherBytesList.push(encipher.final())
      cryptBytes = Buffer.concat(cipherBytesList)
      authTag = encipher.getAuthTag?.()
    } finally {
      destroyBuffers(cipherBytesList)
      encipher.destroy()
    }
    return { cryptBytes, authTag }
  }

  // override
  public decrypt(cipherBytes: Readonly<Buffer>, options?: IDecipherOptions): Buffer {
    const decipher = this.decipher(options)
    const plainBytesList: Buffer[] = []

    let plainBytes: Buffer
    try {
      // Collect and decrypt data
      plainBytesList.push(decipher.update(cipherBytes))
      plainBytesList.push(decipher.final())
      plainBytes = Buffer.concat(plainBytesList)
    } finally {
      destroyBuffers(plainBytesList)
      decipher.destroy()
    }
    return plainBytes
  }

  // override
  public encryptJson(plainData: unknown): IEncryptResult {
    const jsonContent = JSON.stringify(plainData)
    const plainBytes = Buffer.from(jsonContent, 'utf8')
    return this.encrypt(plainBytes)
  }

  // override
  public decryptJson(cryptBytes: Readonly<Buffer>, options?: IDecipherOptions): unknown {
    const plainBytes = this.decrypt(cryptBytes, options)
    const jsonContent: string = plainBytes.toString('utf8')
    return JSON.parse(jsonContent)
  }

  public cleanup(): void {
    this._alive = false
  }
}
