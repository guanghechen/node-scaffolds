import { destroyBuffers } from '@guanghechen/helper-stream'
import type { Cipher } from 'crypto'
import type { ICipher } from '../types/cipher'

/**
 * ICipher base class.
 */
export abstract class BaseCipher implements ICipher {
  // override
  public encrypt(plainData: Readonly<Buffer>): Buffer | never {
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
  public decrypt(cipherData: Readonly<Buffer>): Buffer | never {
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
  public abstract encipher(): Cipher

  // override
  public abstract decipher(): Cipher

  // override
  public abstract cleanup(): void
}
