import type { ICipher, IDecipherOptions, IEncryptResult } from '@guanghechen/cipher'
import { destroyBuffers } from '@guanghechen/helper-buffer'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { consumeStream, consumeStreams } from '@guanghechen/stream'
import type { ILogger } from '@guanghechen/utility-types'
import fs from 'node:fs'
import type { IFileCipher } from './types/IFileCipher'

export interface IFileCipherProps {
  readonly cipher: ICipher
  readonly logger?: ILogger
}

export class FileCipher implements IFileCipher {
  public readonly cipher: ICipher
  protected readonly logger?: ILogger

  constructor(props: IFileCipherProps) {
    this.cipher = props.cipher
    this.logger = props.logger
  }

  // override
  public async encryptFromFiles(plainFilepaths: string[]): Promise<IEncryptResult> {
    for (const fp of plainFilepaths) mkdirsIfNotExists(fp, false, this.logger)
    const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
    const encipher = this.cipher.encipher()
    const pieces: Buffer[] = []

    let cryptBytes: Buffer
    let authTag: Buffer | undefined
    try {
      await consumeStreams(readers, encipher)
      for await (const chunk of encipher) pieces.push(chunk)
      cryptBytes = Buffer.concat(pieces)
      authTag = encipher.getAuthTag?.()
    } finally {
      destroyBuffers(pieces)
      encipher.destroy()
    }
    return { cryptBytes, authTag }
  }

  // override
  public async decryptFromFiles(
    cryptFilepaths: string[],
    options: IDecipherOptions,
  ): Promise<Buffer> {
    for (const fp of cryptFilepaths) mkdirsIfNotExists(fp, false, this.logger)
    const readers: NodeJS.ReadableStream[] = cryptFilepaths.map(fp => fs.createReadStream(fp))
    const decipher = this.cipher.decipher(options)
    const plainBytesList: Buffer[] = []

    let plainBytes: Buffer
    try {
      await consumeStreams(readers, decipher)
      for await (const chunk of decipher) plainBytesList.push(chunk)
      plainBytes = Buffer.concat(plainBytesList)
    } finally {
      destroyBuffers(plainBytesList)
      decipher.destroy()
    }
    return plainBytes
  }

  // @override
  public async encryptFile(
    plainFilepath: string,
    cryptFilepath: string,
  ): Promise<Omit<IEncryptResult, 'cryptBytes'>> {
    mkdirsIfNotExists(cryptFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(plainFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(cryptFilepath)
    const encipher = this.cipher.encipher()

    let authTag: Buffer | undefined
    try {
      await consumeStream(reader, writer, encipher)
      authTag = encipher.getAuthTag?.()
    } finally {
      encipher.destroy()
    }
    return { authTag }
  }

  // @override
  public async decryptFile(
    cryptFilepath: string,
    plainFilepath: string,
    options: IDecipherOptions,
  ): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(cryptFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher = this.cipher.decipher(options)

    try {
      await consumeStream(reader, writer, decipher)
    } finally {
      decipher.destroy()
    }
  }

  // override
  public async encryptFiles(
    plainFilepaths: string[],
    cryptFilepath: string,
  ): Promise<Omit<IEncryptResult, 'cryptBytes'>> {
    invariant(plainFilepaths.length > 0, '[FileCipher.encryptFiles] plainFilepaths is empty.')

    if (plainFilepaths.length === 1) return this.encryptFile(plainFilepaths[0], cryptFilepath)

    mkdirsIfNotExists(cryptFilepath, false, this.logger)
    const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
    const writer: NodeJS.WritableStream = fs.createWriteStream(cryptFilepath)
    const encipher = this.cipher.encipher()

    let authTag: Buffer | undefined
    try {
      await consumeStreams(readers, writer, encipher)
      authTag = encipher.getAuthTag?.()
    } finally {
      encipher.destroy()
    }
    return { authTag }
  }

  // override
  public async decryptFiles(
    cryptFIlepaths: string[],
    plainFilepath: string,
    options: IDecipherOptions,
  ): Promise<void> {
    invariant(cryptFIlepaths.length > 0, '[FileCipher.decryptFiles] cryptFilepaths is empty.')

    if (cryptFIlepaths.length === 1) {
      return void (await this.decryptFile(cryptFIlepaths[0], plainFilepath, options))
    }

    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const readers: NodeJS.ReadableStream[] = cryptFIlepaths.map(fp => fs.createReadStream(fp))
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher = this.cipher.decipher(options)

    try {
      await consumeStreams(readers, writer, decipher)
    } finally {
      decipher.destroy()
    }
  }
}
