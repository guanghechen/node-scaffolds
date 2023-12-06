import type { IReporter } from '@guanghechen/reporter.types'
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
  reporter?: IReporter
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
    reporter,
    lineEnd = DEFAULT_LINE_END,
  } = options

  try {
    reporter?.debug('[paste] try: clipboardy')

    const clipboardy = await import('clipboardy').then(md => md.default)
    const content: string = await clipboardy.read()
    return normalizeOutput(content, lineEnd)
  } catch (error) {
    reporter?.debug(`[paste] Failed to read clipboard through clipboardy:`, error)
  }

  if (pasteCommandPath != null) {
    // is windows or wsl, use clipboardy (as powershell Get-Clipboard will return messy code).
    reporter?.debug(`[paste] try: ${pasteCommandPath} ${pasteCommandArgs.join(' ')}`)
    try {
      const { execa } = await import('execa')
      const { stdout } = await execa(pasteCommandPath, pasteCommandArgs)
      let content = stdout.toString()
      if (/powershell/.test(pasteCommandPath)) {
        content = content.replace(/^([^]*?)(?:\r\n|\n\r|[\n\r])$/, '$1')
      }
      return normalizeOutput(content, lineEnd)
    } catch (error) {
      reporter?.debug(`[paste] Failed to call ${pasteCommandPath}:`, error)
    }
  }

  if (fakeClipboard != null) {
    reporter?.debug('[paste] try: fake clipboard {}.', fakeClipboard.filepath)
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
