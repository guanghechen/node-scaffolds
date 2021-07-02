import type ChalkLogger from '@guanghechen/chalk-logger'
import { mkdirsIfNotExists } from '@guanghechen/file-helper'
import type { Cipher } from 'crypto'
import fs from 'fs-extra'
import type { CipherHelper } from './types'
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

    try {
      // encrypt data
      cipherDataPieces.push(encipher.update(plainData))
      cipherDataPieces.push(encipher.final())

      // collect encrypted data pieces
      const cipherData: Buffer = Buffer.concat(cipherDataPieces)
      return cipherData
    } finally {
      destroyBuffers(cipherDataPieces)
    }
  }

  // override
  public decrypt(cipherData: Readonly<Buffer>): Buffer | never {
    const decipher = this.decipher()
    const plainDataPieces: Buffer[] = []

    try {
      // decrypt data
      plainDataPieces.push(decipher.update(cipherData))
      plainDataPieces.push(decipher.final())

      // collect decrypted data pieces
      const plainData: Buffer = Buffer.concat(plainDataPieces)
      return plainData
    } finally {
      destroyBuffers(plainDataPieces)
    }
  }

  // @override
  public async encryptFile(
    plainFilepath: string,
    cipherFilepath: string,
  ): Promise<void> {
    mkdirsIfNotExists(cipherFilepath, false, this.logger)

    const encipher: Cipher = this.encipher()
    const reader: fs.ReadStream = fs.createReadStream(plainFilepath)
    const writer: fs.WriteStream = fs.createWriteStream(cipherFilepath)

    const pipe = encipher.pipe(writer, { end: false })
    await new Promise((resolve, reject) => {
      reader
        .on('data', chunk => encipher.write(chunk))
        .on('error', reject)
        .on('end', resolve)
    })
    pipe.close()
    writer.close()
  }

  // @override
  public async decryptFile(
    cipherFilepath: string,
    plainFilepath: string,
  ): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)

    const decipher: Cipher = this.decipher()
    const reader: fs.ReadStream = fs.createReadStream(cipherFilepath)
    const writer: fs.WriteStream = fs.createWriteStream(plainFilepath)

    const pipe = decipher.pipe(writer, { end: false })
    await new Promise((resolve, reject) => {
      reader
        .on('data', chunk => decipher.write(chunk))
        .on('error', reject)
        .on('end', resolve)
    })
    pipe.close()
    writer.close()
  }

  // override
  public async encryptFiles(
    plainFilepaths: string[],
    cipherFilepath: string,
  ): Promise<void> {
    mkdirsIfNotExists(cipherFilepath, false, this.logger)

    const writer: fs.WriteStream = fs.createWriteStream(cipherFilepath)
    const encipher: Cipher = this.encipher()

    const pipe = encipher.pipe(writer, { end: false })
    for (const filepath of plainFilepaths) {
      const reader: fs.ReadStream = fs.createReadStream(filepath)
      await new Promise((resolve, reject) => {
        reader
          .on('data', chunk => encipher.write(chunk))
          .on('error', reject)
          .on('end', resolve)
      })
    }
    pipe.close()
    writer.close()
  }

  // override
  public async decryptFiles(
    cipherFilepaths: string[],
    plainFilepath: string,
  ): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)

    const writer: fs.WriteStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.decipher()

    const pipe = decipher.pipe(writer)
    for (const filepath of cipherFilepaths) {
      const reader: fs.ReadStream = fs.createReadStream(filepath)
      await new Promise((resolve, reject) => {
        reader
          .on('data', chunk => decipher.write(chunk))
          .on('error', reject)
          .on('end', resolve)
      })
    }
    pipe.close()
    writer.close()
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
