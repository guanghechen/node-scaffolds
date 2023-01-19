import type { ChalkLogger } from '@guanghechen/chalk-logger'
import { mkdirsIfNotExists, writeFile } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { existsSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'

export interface IFakeClipboardProps {
  filepath: string
  encoding?: BufferEncoding
  logger?: ChalkLogger
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IFakeClipboardReadOptions {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IFakeClipboardWriteOptions {}

export class FakeClipboard {
  public readonly filepath: string
  public readonly encoding: BufferEncoding
  public readonly logger: ChalkLogger | null = null
  private isInitialized = false

  constructor(props: IFakeClipboardProps) {
    const { filepath, encoding, logger } = props
    this.logger = logger ?? null
    this.encoding = encoding ?? 'utf8'
    this.filepath = filepath
  }

  public async read(_options: IFakeClipboardReadOptions = {}): Promise<string> {
    await this.init()
    return await fs.readFile(this.filepath!, this.encoding)
  }

  public async write(content: string, _options: IFakeClipboardWriteOptions = {}): Promise<void> {
    await this.init()
    invariant(this.filepath != null, '[FakeClipboard.write] filepath is null/undefined.')
    await writeFile(this.filepath, content, this.encoding)
  }

  protected async init(): Promise<void> {
    if (this.isInitialized) return

    const { filepath, logger } = this
    if (existsSync(filepath)) {
      invariant(statSync(filepath).isFile(), () => `[FakeClipboard] ${filepath} is not a file`)
      return
    }
    logger?.verbose(`[FakeClipboard] init fake-clipboard (${filepath}).`)
    mkdirsIfNotExists(filepath, false)
    await fs.writeFile(filepath, '', this.encoding)

    this.isInitialized = true
  }
}
