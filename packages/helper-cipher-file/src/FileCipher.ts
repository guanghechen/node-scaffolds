import type { ICipher } from '@guanghechen/helper-cipher'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import { consumeStream, consumeStreams, destroyBuffers } from '@guanghechen/helper-stream'
import type { ILogger } from '@guanghechen/utility-types'
import type { Cipher } from 'node:crypto'
import fs from 'node:fs'
import type { IFileCipher } from './types/IFileCipher'

interface IFileCipherProps {
  readonly cipher: ICipher
  readonly logger?: ILogger
}

/**
 * ICipher base class.
 */
export class FileCipher implements IFileCipher {
  public readonly cipher: ICipher
  protected readonly logger?: ILogger

  constructor(props: IFileCipherProps) {
    this.cipher = props.cipher
    this.logger = props.logger
  }

  // override
  public async encryptFromFiles(plainFilepaths: string[]): Promise<Buffer | never> {
    const encipher: Cipher = this.cipher.encipher()
    const pieces: Buffer[] = []
    try {
      for (const plainFilepath of plainFilepaths) {
        mkdirsIfNotExists(plainFilepath, false, this.logger)
      }

      const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
      await consumeStreams(readers, encipher)
      for await (const chunk of encipher) pieces.push(chunk)
      return Buffer.concat(pieces)
    } finally {
      destroyBuffers(pieces)
      encipher.destroy()
    }
  }

  // override
  public async decryptFromFiles(cryptFilepaths: string[]): Promise<Buffer> {
    const decipher: Cipher = this.cipher.decipher()
    const pieces: Buffer[] = []
    try {
      for (const cryptFilepath of cryptFilepaths) {
        mkdirsIfNotExists(cryptFilepath, false, this.logger)
      }

      const readers: NodeJS.ReadableStream[] = cryptFilepaths.map(fp => fs.createReadStream(fp))
      await consumeStreams(readers, decipher)
      for await (const chunk of decipher) pieces.push(chunk)
      return Buffer.concat(pieces)
    } finally {
      destroyBuffers(pieces)
      decipher.destroy()
    }
  }

  // @override
  public encryptFile(plainFilepath: string, cryptFilepath: string): Promise<void> {
    mkdirsIfNotExists(cryptFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(plainFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(cryptFilepath)
    const encipher: Cipher = this.cipher.encipher()
    return consumeStream(reader, writer, encipher)
  }

  // @override
  public decryptFile(cryptFilepath: string, plainFilepath: string): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(cryptFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.cipher.decipher()
    return consumeStream(reader, writer, decipher)
  }

  // override
  public async encryptFiles(plainFilepaths: string[], cryptFilepath: string): Promise<void> {
    if (plainFilepaths.length <= 0) return
    if (plainFilepaths.length === 1) {
      await this.encryptFile(plainFilepaths[0], cryptFilepath)
      return
    }

    mkdirsIfNotExists(cryptFilepath, false, this.logger)
    const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
    const writer: NodeJS.WritableStream = fs.createWriteStream(cryptFilepath)
    const encipher: Cipher = this.cipher.encipher()
    await consumeStreams(readers, writer, encipher)
    encipher.destroy()
  }

  // override
  public async decryptFiles(cryptFIlepaths: string[], plainFilepath: string): Promise<void> {
    if (cryptFIlepaths.length <= 0) return
    if (cryptFIlepaths.length === 1) {
      await this.decryptFile(cryptFIlepaths[0], plainFilepath)
      return
    }

    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const readers: NodeJS.ReadableStream[] = cryptFIlepaths.map(fp => fs.createReadStream(fp))
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.cipher.decipher()
    await consumeStreams(readers, writer, decipher)
    decipher.destroy()
  }
}
