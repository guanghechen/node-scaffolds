import type { ChalkLogger } from '@guanghechen/chalk-logger'
import clipboardy from 'clipboardy'
import { execa } from 'execa'
import type { FakeClipboard } from './fake-clipboard'

export interface ICopyOptions {
  /**
   * System `copy` command location.
   */
  copyCommandPath?: string
  /**
   * Arguments passed to the `copy` command.
   */
  copyCommandArgs?: string[]
  /**
   * Fake clipboard.
   */
  fakeClipboard?: FakeClipboard
  /**
   * Logger.
   */
  logger?: ChalkLogger
}

/**
 * Copy content to system clipboard.
 * @param content           the content you want to write into system clipboard.
 * @param options
 */
export async function copy(content: string, options: ICopyOptions = {}): Promise<void | never> {
  const { copyCommandPath, copyCommandArgs = [], fakeClipboard, logger } = options

  try {
    logger?.debug('[copy] try: clipboardy')
    await clipboardy.write(content)
    return
  } catch (error) {
    logger?.debug(`[copy] Failed to write clipboard through clipboardy:`, error)
  }

  if (copyCommandPath != null) {
    // is windows or wsl, use clipboardy (as powershell Get-Clipboard will return messy code).
    logger?.debug(`[copy] try: ${copyCommandPath} ${copyCommandArgs.join(' ')}`)
    try {
      await execa(copyCommandPath, copyCommandArgs, { input: content })
      return
    } catch (error) {
      logger?.debug(`[copy] Failed to call ${copyCommandPath}`, error)
    }
  }

  if (fakeClipboard != null) {
    logger?.debug('[copy] try: fake clipboard {}.', fakeClipboard.filepath)
    await fakeClipboard.write(content)
    return
  }
  throw `[copy] Cannot find available clipboard or fake-clipboard.`
}
