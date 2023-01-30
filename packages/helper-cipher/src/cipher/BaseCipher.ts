import type { Cipher } from 'node:crypto'
import { randomBytes } from 'node:crypto'
import type { ICipher } from '../types/ICipher'
import { destroyBuffers } from '../util'

/**
 * ICipher base class.
 */
export abstract class BaseCipher implements ICipher {
  protected _alive: boolean

  constructor() {
    this._alive = true
  }

  public get alive(): boolean {
    return this._alive
  }

  // override
  public encrypt(plainData: Readonly<Buffer>): Buffer {
    const encipher = this.encipher()
    const cipherDataPieces: Buffer[] = []
    let cipherData: Buffer

    try {
      // Collect and encrypt data
      cipherDataPieces.push(encipher.update(plainData))
      cipherDataPieces.push(encipher.final())
      cipherData = Buffer.concat(cipherDataPieces)
    } finally {
      destroyBuffers(cipherDataPieces)
      encipher.destroy()
    }

    return cipherData
  }

  // override
  public decrypt(cipherData: Readonly<Buffer>): Buffer {
    const decipher = this.decipher()
    const plainDataPieces: Buffer[] = []
    let plainData: Buffer

    try {
      // Collect and decrypt data
      plainDataPieces.push(decipher.update(cipherData))
      plainDataPieces.push(decipher.final())
      plainData = Buffer.concat(plainDataPieces)
    } finally {
      destroyBuffers(plainDataPieces)
      decipher.destroy()
    }

    return plainData
  }

  // override
  public encryptJson(plainData: unknown): Buffer {
    const content = JSON.stringify(plainData)
    const sealedContent = this._seal(content)
    const buffer = Buffer.from(sealedContent, 'utf8')
    return this.encrypt(buffer)
  }

  // override
  public decryptJson(cipherData: Readonly<Buffer>): unknown {
    const plainData: Buffer = this.decrypt(cipherData)
    const jsonContent: string = this._strip(plainData.toString('utf8'))
    const data = JSON.parse(jsonContent)
    return data
  }

  public cleanup(): void {
    this._alive = false
  }

  // override
  public abstract encipher(): Cipher

  // override
  public abstract decipher(): Cipher

  /**
   * Adds some random characters for obfuscation.
   * @param content
   */
  protected _seal(content: string): string {
    const startSaltSize = Math.ceil(Math.random() * 70 + 30)
    const endSaltSize = Math.ceil(Math.random() * 70 + 30)
    return (
      '#' +
      randomBytes(startSaltSize).toString('hex') +
      '#' +
      content +
      '#' +
      randomBytes(endSaltSize).toString('hex') +
      '#'
    )
  }

  /**
   * Remove salts.
   * @param content
   */
  protected _strip(content: string): string {
    return content.replace(/^#[\da-f]+#/i, '').replace(/#[\da-f]+#$/i, '')
  }
}
