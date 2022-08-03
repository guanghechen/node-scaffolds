import type ChalkLogger from '@guanghechen/chalk-logger'
import { mkdirsIfNotExists } from '@guanghechen/helper-file'
import type { Cipher } from 'crypto'
import fs from 'fs-extra'
import type { CipherHelper } from './types/cipher-helper'
import { destroyBuffers } from './util/buffer'

/**
 * CipherHelper base class.
 */
export abstract class BaseCipherHelper implements CipherHelper {
  protected readonly logger?: ChalkLogger

  constructor(logger?: ChalkLogger) {
    this.logger = logger
  }

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
  public async encryptFromFiles(plainFilepaths: string[]): Promise<Buffer> {
    const encipher: Cipher = this.encipher()
    const cipherDataPieces: Buffer[] = []
    let cipherData: Buffer

    try {
      for (const filepath of plainFilepaths) {
        const reader: fs.ReadStream = fs.createReadStream(filepath)
        await new Promise((resolve, reject) => {
          reader
            .on('data', chunk => void cipherDataPieces.push(encipher.update(chunk)))
            .on('error', reject)
            .on('end', resolve)
        })
      }

      cipherDataPieces.push(encipher.final())
      cipherData = Buffer.concat(cipherDataPieces)
    } finally {
      destroyBuffers(cipherDataPieces)
      encipher.destroy()
    }

    return cipherData
  }

  // override
  public async decryptFromFiles(cipherFilepaths: string[]): Promise<Buffer> {
    const decipher: Cipher = this.decipher()
    const plainDataPieces: Buffer[] = []
    let plainData: Buffer

    try {
      for (const filepath of cipherFilepaths) {
        const reader: fs.ReadStream = fs.createReadStream(filepath)
        await new Promise((resolve, reject) => {
          reader
            .on('data', chunk => void plainDataPieces.push(decipher.update(chunk)))
            .on('error', reject)
            .on('end', resolve)
        })
      }

      plainDataPieces.push(decipher.final())
      plainData = Buffer.concat(plainDataPieces)
    } finally {
      destroyBuffers(plainDataPieces)
      decipher.destroy()
    }

    return plainData
  }

  // @override
  public encryptFile(plainFilepath: string, cipherFilepath: string): Promise<void> {
    mkdirsIfNotExists(cipherFilepath, false, this.logger)

    const encipher: Cipher = this.encipher()
    const reader = fs.createReadStream(plainFilepath)
    const writer = fs.createWriteStream(cipherFilepath)
    return new Promise<void>((resolve, reject) => {
      reader.pipe(encipher).pipe(writer).on('error', reject).on('finish', resolve)
    })
  }

  // @override
  public decryptFile(cipherFilepath: string, plainFilepath: string): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)

    const decipher: Cipher = this.decipher()
    const reader = fs.createReadStream(cipherFilepath)
    const writer = fs.createWriteStream(plainFilepath)
    return new Promise<void>((resolve, reject) => {
      reader.pipe(decipher).pipe(writer).on('error', reject).on('finish', resolve)
    })
  }

  // override
  public async encryptFiles(plainFilepaths: string[], cipherFilepath: string): Promise<void> {
    if (plainFilepaths.length <= 0) return
    if (plainFilepaths.length === 1) {
      await this.encryptFile(plainFilepaths[0], cipherFilepath)
      return
    }

    mkdirsIfNotExists(cipherFilepath, false, this.logger)

    const writer: fs.WriteStream = fs.createWriteStream(cipherFilepath)
    const encipher: Cipher = this.encipher()
    const pipe = encipher.pipe(writer)

    for (const filepath of plainFilepaths) {
      const reader: fs.ReadStream = fs.createReadStream(filepath)
      await new Promise((resolve, reject) => {
        reader
          .on('data', chunk => encipher.write(chunk))
          .on('error', reject)
          .on('end', resolve)
      })
    }

    encipher.end()
    await new Promise((resolve, reject) => {
      pipe.on('error', reject).on('finish', resolve).on('end', resolve)
    })
    encipher.destroy()
  }

  // override
  public async decryptFiles(cipherFilepaths: string[], plainFilepath: string): Promise<void> {
    if (cipherFilepaths.length <= 0) return
    if (cipherFilepaths.length === 1) {
      await this.decryptFile(cipherFilepaths[0], plainFilepath)
      return
    }

    mkdirsIfNotExists(plainFilepath, false, this.logger)

    const writer: fs.WriteStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.decipher()
    const pipe = decipher.pipe(writer)

    for (const filepath of cipherFilepaths) {
      const reader: fs.ReadStream = fs.createReadStream(filepath)
      await new Promise<void>((resolve, reject) => {
        reader
          .on('data', chunk => decipher.write(chunk))
          .on('error', reject)
          .on('end', resolve)
      })
    }

    decipher.end()
    await new Promise((resolve, reject) => {
      pipe.on('error', reject).on('finish', resolve).on('end', resolve)
    })
    decipher.destroy()
  }

  protected abstract encipher(): Cipher

  protected abstract decipher(): Cipher

  /**
   * @override
   */
  public abstract createSecret(): Buffer

  /**
   * @override
   */
  public abstract initFromSecret(secret: Readonly<Buffer>): void | never

  /**
   * @override
   */
  public abstract initFromPassword(password: Readonly<Buffer>): void | never

  /**
   * @override
   */
  public abstract cleanup(): void
}
