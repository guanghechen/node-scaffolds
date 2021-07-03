import type { FilePartItem } from '@guanghechen/file-helper'
import {
  BigFileHelper,
  absoluteOfWorkspace,
  calcFilePartItemsBySize,
  collectAllFilesSync,
  mkdirsIfNotExists,
  relativeOfWorkspace,
} from '@guanghechen/file-helper'
import invariant from '@guanghechen/invariant'
import crypto from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import type { CatalogIndex, CatalogItem } from './types/catalog'
import type { CipherHelper } from './types/cipher-helper'
import { destroyBuffer } from './util/buffer'
import { calcFingerprint, calcMacFromFile } from './util/key'

export interface CipherCatalogOptions {
  /**
   * A collect of util funcs for encryption / decryption.
   */
  readonly cipher: CipherHelper

  /**
   * Root directory of source files.
   */
  readonly sourceRootDir: string

  /**
   * Root directory of target files.
   */
  readonly targetRootDir: string

  /**
   * Encoding of source contents.
   * @default 'utf8'
   */
  readonly sourceEncoding?: BufferEncoding

  /**
   * Encoding of ciphered catalog index file.
   * @default 'base64'
   */
  readonly cipheredIndexEncoding?: BufferEncoding

  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   *
   * For safety, this value should be greater than or equal to 1024.
   *
   * @default Number.MAX_SAFE_INTEGER
   */
  readonly maxTargetFileSize?: number
}

export class CipherCatalog {
  public readonly sourceRootDir: string
  public readonly targetRootDir: string
  public readonly sourceEncoding: BufferEncoding
  public readonly cipheredIndexEncoding: BufferEncoding
  public readonly maxTargetFileSize: number
  protected readonly cipher: CipherHelper
  protected readonly fileHelper: BigFileHelper
  protected readonly items: Array<Readonly<CatalogItem>>
  protected readonly sourceFilepathMap: Map<string, Readonly<CatalogItem>>
  protected readonly targetFilepathSet: Set<string>
  protected readonly targetPartPathSet: Set<string>
  protected lastCheckTime: string | null

  constructor(options: CipherCatalogOptions) {
    const sourceRootDir = options.sourceRootDir
    const targetRootDir = options.targetRootDir
    const sourceEncoding = options.sourceEncoding ?? 'utf8'
    const cipheredIndexEncoding = options.cipheredIndexEncoding ?? 'base64'
    const maxTargetFileSize = Math.max(
      1024,
      options.maxTargetFileSize ?? Number.MAX_SAFE_INTEGER,
    )

    invariant(
      fs.existsSync(sourceRootDir),
      `[FILEPATH_NOT_FOUND] cannot find sourceRootDir: ${sourceRootDir}`,
    )

    this.cipher = options.cipher
    this.fileHelper = new BigFileHelper({ encoding: undefined })
    this.sourceRootDir = sourceRootDir
    this.targetRootDir = targetRootDir
    this.sourceEncoding = sourceEncoding
    this.cipheredIndexEncoding = cipheredIndexEncoding
    this.items = []
    this.maxTargetFileSize = maxTargetFileSize
    this.sourceFilepathMap = new Map()
    this.targetFilepathSet = new Set()
    this.targetPartPathSet = new Set()
    this.lastCheckTime = null

    mkdirsIfNotExists(this.targetRootDir, true)
  }

  /**
   * Load catalog states from ciphered contents.
   * @param cipheredContent
   */
  public load(cipheredContent: string): void {
    const { cipheredIndexEncoding } = this
    const cipherData: Buffer = Buffer.from(
      cipheredContent,
      cipheredIndexEncoding,
    )

    // Decrypt data.
    const plainContent = this.cipher.decrypt(cipherData)

    // Remove salt.
    const content = this.strip(plainContent.toString())

    // parse the content
    const { items, lastCheckTime } = JSON.parse(content) as CatalogIndex

    const {
      sourceFilepathMap: sfm,
      targetFilepathSet: tfs,
      targetPartPathSet: tps,
    } = this

    this.reset()
    this.lastCheckTime = lastCheckTime
    for (const item of items) {
      this.items.push(item)
      sfm.set(item.sourceFilepath, item)
      tfs.add(item.targetFilename)
      for (const part of item.targetParts) tps.add(part)
    }
  }

  /**
   * Dump catalog data
   */
  public dump(): string {
    const {
      cipher,
      items,
      lastCheckTime,
      sourceEncoding,
      cipheredIndexEncoding,
    } = this

    const data: CatalogIndex = { lastCheckTime, items }
    const plaintextContent: string = JSON.stringify(data)

    // Add salt.
    const content = this.seal(plaintextContent)

    // save into the index file
    const sourceData: Buffer = Buffer.from(content, sourceEncoding)
    const cipherData = cipher
      .encrypt(sourceData)
      .toString(cipheredIndexEncoding)

    destroyBuffer(sourceData)
    return cipherData
  }

  /**
   * Load data from index file.
   * @param indexFilepath   The path of catalog index file
   */
  public async loadFromFile(indexFilepath: string): Promise<void> {
    invariant(
      fs.existsSync(indexFilepath),
      `[FILEPATH_NOT_FOUND] cannot find index file: ${indexFilepath}`,
    )

    // load content from index file
    const { sourceEncoding } = this
    const cipherContent = await fs.readFile(indexFilepath, sourceEncoding)
    this.load(cipherContent)
  }

  /**
   * Dump catalog data and save into the index file.
   * @param indexFilepath   The path of catalog index file
   */
  public async save(indexFilepath: string): Promise<void> {
    const cipherData = this.dump()
    const { sourceEncoding } = this

    mkdirsIfNotExists(indexFilepath, false)
    await fs.writeFile(indexFilepath, cipherData, sourceEncoding)
  }

  /**
   * Reset catalog states.
   */
  public reset(): void {
    this.items.splice(0, this.items.length)
    this.sourceFilepathMap.clear()
    this.targetFilepathSet.clear()
    this.targetPartPathSet.clear()
    this.lastCheckTime = null
  }

  /**
   * Delete invalid entries on the catalog and clean up unregistered target files.
   */
  public cleanup(): void {
    const {
      items,
      sourceFilepathMap: sfm,
      targetFilepathSet: tfs,
      targetPartPathSet: tps,
    } = this

    // Delete invalid entries on the catalog.
    for (let i = 0, _size = items.length; i < _size; ) {
      const item = items[i]
      const absoluteSourceFilepath = this.calcAbsoluteSourceFilepath(
        item.sourceFilepath,
      )

      if (fs.existsSync(absoluteSourceFilepath)) {
        i += 1
        continue
      }

      _size -= 1
      items.splice(i, 1)
      sfm.delete(item.sourceFilepath)
      tfs.delete(item.targetFilename)
      for (const part of item.targetParts) tps.delete(part)
    }

    // Clean up unregistered target.
    const targetFiles = collectAllFilesSync(this.targetRootDir)
    for (const absoluteTargetFilepath of targetFiles) {
      const part = this.calcRelativeTargetFilepath(absoluteTargetFilepath)
      if (tps.has(part)) continue
      fs.unlinkSync(absoluteTargetFilepath)
    }
  }

  /**
   * Update the lastCheckTime of the workspace.
   * @param mtime
   */
  public touch(date?: Date): void {
    const mtime = (date ?? new Date()).toISOString()
    if (this.lastCheckTime != null && this.lastCheckTime >= mtime) return
    this.lastCheckTime = mtime
  }

  /**
   * Check if files are damaged.
   */
  public checkIntegrity(): void | never {
    for (const item of this.items) {
      for (const part of item.targetParts) {
        const filepath = this.calcAbsoluteTargetFilepath(part)
        invariant(
          fs.existsSync(filepath),
          `[INTEGRITY DAMAGE] cannot found ${filepath}`,
        )
      }
    }

    const allTargetFiles = collectAllFilesSync(this.targetRootDir)
    invariant(
      allTargetFiles.length === this.targetPartPathSet.size,
      `[INTEGRITY DAMAGE] there are ${this.items.length} files in index file,` +
        ` but actually there are ${allTargetFiles.length} files in the cipher directory`,
    )
  }

  /**
   * Register a item into the catalog and perform some cleanup operations.
   *
   * @param _sourceFilepath
   * @param targetFilename
   * @param _targetParts
   * @returns
   */
  public async register(_sourceFilepath: string): Promise<void> {
    const absoluteSourceFilepath =
      this.calcAbsoluteSourceFilepath(_sourceFilepath)
    const sourceFilepath = this.calcRelativeSourceFilepath(
      absoluteSourceFilepath,
    )

    const { sourceFilepathMap: sfm, targetFilepathSet: tfs } = this
    const stat: fs.Stats = await fs.stat(absoluteSourceFilepath)
    const size = stat.size
    const mtime = stat.mtime.toISOString()
    const mac = await calcMacFromFile(absoluteSourceFilepath)
    const fingerprint = calcFingerprint(mac)

    let item: CatalogItem | undefined = sfm.get(sourceFilepath)
    if (item != null) {
      // Return directly if there is no modification.
      if (
        item.size === size &&
        item.fingerprint === fingerprint &&
        item.targetParts.every(p => fs.existsSync(p))
      ) {
        return
      }

      item.mtime = mtime
      item.fingerprint = fingerprint
      item.size = size
    } else {
      const targetFilename = this.generateTargetFilename(sourceFilepath)
      item = {
        fingerprint,
        size,
        mtime,
        sourceFilepath,
        targetFilename,
        targetParts: [],
      }

      this.items.push(item)
      sfm.set(item.sourceFilepath, item)
      tfs.add(item.targetFilename)
    }

    await this.writeTargets(item)
  }

  public async decryptAll(sourceBakRootDir: string): Promise<void> {
    for (const item of this.items) {
      const sourceBakFilepath = path.join(sourceBakRootDir, item.sourceFilepath)
      await this.cipher.decryptFiles(
        item.targetParts.map(p => this.calcAbsoluteTargetFilepath(p)),
        sourceBakFilepath,
      )
    }
  }

  /**
   * Check if the file has modified since it was last saved.
   * @param _sourceFilepath
   */
  public isModified(_sourceFilepath: string, _stat?: fs.Stats): boolean {
    if (this.lastCheckTime == null) return true

    const absoluteSourceFilepath =
      this.calcAbsoluteSourceFilepath(_sourceFilepath)
    const sourceFilepath = this.calcRelativeSourceFilepath(
      absoluteSourceFilepath,
    )

    const item: CatalogItem | undefined =
      this.sourceFilepathMap.get(sourceFilepath)
    if (item === undefined) return true

    const stat = _stat ?? fs.statSync(absoluteSourceFilepath)
    return (
      stat.size !== item.size || this.lastCheckTime < stat.mtime.toISOString()
    )
  }

  /**
   * Generate a target filename.
   * @returns
   */
  public generateTargetFilename(sourceFilepath: string): string {
    const { sourceFilepathMap: sfm, targetFilepathSet: tfs } = this
    const item = sfm.get(sourceFilepath)
    if (item != null) return item.targetFilename

    for (;;) {
      const filename: string = crypto.randomBytes(32).toString('hex')
      if (!tfs.has(filename)) return filename
    }
  }

  /**
   * Resolve the relative path of the source file.
   * @param absoluteSourceFilepath
   */
  public calcRelativeSourceFilepath(absoluteSourceFilepath: string): string {
    const filepath = relativeOfWorkspace(
      this.sourceRootDir,
      absoluteSourceFilepath,
    )
    return filepath.replace(/[/\\]+/g, '/')
  }

  /**
   * Resolve the absolute path of a source file.
   * @param sourceFilepath
   */
  public calcAbsoluteSourceFilepath(sourceFilepath: string): string {
    const filepath = absoluteOfWorkspace(this.sourceRootDir, sourceFilepath)
    return filepath
  }

  /**
   * Resolve the relative path of a target file.
   * @param absoluteTargetFilepath
   */
  public calcRelativeTargetFilepath(absoluteTargetFilepath: string): string {
    const filepath = relativeOfWorkspace(
      this.targetRootDir,
      absoluteTargetFilepath,
    )
    return filepath.replace(/[/\\]+/g, '/')
  }

  /**
   * Resolve the absolute path of a target file.
   * @param targetFilepath
   */
  public calcAbsoluteTargetFilepath(targetFilepath: string): string {
    const filepath = absoluteOfWorkspace(this.targetRootDir, targetFilepath)
    return filepath
  }

  /**
   * Write one or more target files according to the information recorded by
   * the catalog item.
   *
   * @param item
   */
  protected async writeTargets(item: CatalogItem): Promise<void> {
    const {
      cipher,
      fileHelper,
      targetPartPathSet: tps,
      maxTargetFileSize,
    } = this

    const absoluteSourceFilepath = this.calcAbsoluteSourceFilepath(
      item.sourceFilepath,
    )
    const absoluteTargetFilepath = this.calcAbsoluteTargetFilepath(
      item.targetFilename,
    )

    // Encrypt source file.
    await cipher.encryptFile(absoluteSourceFilepath, absoluteTargetFilepath)

    // Split target file.
    const parts: FilePartItem[] = calcFilePartItemsBySize(
      absoluteTargetFilepath,
      maxTargetFileSize,
    )
    const partFilepaths: string[] = await fileHelper.split(
      absoluteTargetFilepath,
      parts,
    )

    // Update target parts.
    const targetParts: string[] = partFilepaths.map(p =>
      this.calcRelativeTargetFilepath(p),
    )
    for (const filepath of item.targetParts) tps.delete(filepath)
    for (const filepath of targetParts) tps.add(filepath)
    for (const filepath of item.targetParts) {
      if (tps.has(filepath) || !fs.existsSync(filepath)) continue
      fs.unlinkSync(filepath)
    }
    // eslint-disable-next-line no-param-reassign
    item.targetParts = targetParts
  }

  /**
   * Adds some random characters for obfuscation.
   * @param content
   */
  protected seal(content: string): string {
    const startSaltSize = Math.ceil(Math.random() * 70 + 30)
    const endSaltSize = Math.ceil(Math.random() * 70 + 30)
    return (
      crypto.randomBytes(startSaltSize).toString('hex') +
      content +
      crypto.randomBytes(endSaltSize).toString('hex')
    )
  }

  /**
   * Remove salts.
   * @param content
   */
  protected strip(content: string): string {
    return content.replace(/^[0-9a-z]+/, '').replace(/[0-9a-z]+$/, '')
  }
}
