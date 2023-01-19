import type { ILogger } from '@guanghechen/utility-types'
import clipboardy from 'clipboardy'
import { execa } from 'execa'
import { DEFAULT_LINE_END } from './constant'
import type { FakeClipboard } from './fake-clipboard'

export interface IPasteOptions {
  /**
   * System `paste` command location.
   */
  pasteCommandPath?: string
  /**
   * Arguments passed to the `paste` command.
   */
  pasteCommandArgs?: string[]
  /**
   * Fake clipboard.
   */
  fakeClipboard?: FakeClipboard
  /**
   * Logger.
   */
  logger?: ILogger
  /**
   * System line-ending symbol.
   */
  lineEnd?: string
}

/**
 * get the data from system clipboard
 * @param options
 */
export async function paste(options: IPasteOptions = {}): Promise<string | never> {
  const {
    pasteCommandPath,
    pasteCommandArgs = [],
    fakeClipboard,
    logger,
    lineEnd = DEFAULT_LINE_END,
  } = options

  try {
    logger?.debug('[paste] try: clipboardy')
    const content: string = await clipboardy.read()
    return normalizeOutput(content, lineEnd)
  } catch (error) {
    logger?.debug(`[paste] Failed to read clipboard through clipboardy:`, error)
  }

  if (pasteCommandPath != null) {
    // is windows or wsl, use clipboardy (as powershell Get-Clipboard will return messy code).
    logger?.debug(`[paste] try: ${pasteCommandPath} ${pasteCommandArgs.join(' ')}`)
    try {
      const { stdout } = await execa(pasteCommandPath, pasteCommandArgs)
      let content = stdout.toString()
      if (/powershell/.test(pasteCommandPath)) {
        content = content.replace(/^([^]*?)(?:\r\n|\n\r|[\n\r])$/, '$1')
      }
      return normalizeOutput(content, lineEnd)
    } catch (error) {
      logger?.debug(`[paste] Failed to call ${pasteCommandPath}:`, error)
    }
  }

  if (fakeClipboard != null) {
    logger?.debug('[paste] try: fake clipboard {}.', fakeClipboard.filepath)
    return await fakeClipboard.read()
  }
  throw `[paste] Cannot find available clipboard or fake-clipboard.`
}

/**
 * Process the data from system clipboard.
 */
function normalizeOutput(output: string, lineEnd: string): string {
  return output ? output.replace(/\r\n|\r|\n/g, lineEnd) : ''
}
