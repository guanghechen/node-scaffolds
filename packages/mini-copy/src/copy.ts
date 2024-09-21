import type { IReporter } from '@guanghechen/reporter.types'
import { spawn } from 'node:child_process'
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
  reporter?: IReporter
}

/**
 * Copy content to system clipboard.
 * @param content           the content you want to write into system clipboard.
 * @param options
 */
export async function copy(content: string, options: ICopyOptions = {}): Promise<void | never> {
  const { copyCommandPath, copyCommandArgs = [], fakeClipboard, reporter } = options

  try {
    reporter?.debug('[copy] try: clipboardy')
    const clipboardy = await import('clipboardy').then(md => md.default)
    await clipboardy.write(content)
    return
  } catch (error) {
    reporter?.debug('[copy] Failed to write clipboard through clipboardy:', error)
  }

  if (copyCommandPath != null) {
    // is windows or wsl, use clipboardy (as powershell Get-Clipboard will return messy code).
    reporter?.debug(`[copy] try: ${copyCommandPath} ${copyCommandArgs.join(' ')}`)
    try {
      await new Promise<void>((resolve, reject) => {
        const command = spawn(copyCommandPath)
        command.stdin.write(content)
        command.stdin.end()
        command.on('close', code => {
          if (code === 0) resolve()
          else reject('[paste] Failed to copy content to clipboard')
        })
      })
      return
    } catch (error) {
      reporter?.debug(`[copy] Failed to call ${copyCommandPath}`, error)
    }
  }

  if (fakeClipboard != null) {
    reporter?.debug('[copy] try: fake clipboard {}.', fakeClipboard.filepath)
    await fakeClipboard.write(content)
    return
  }

  // eslint-disable-next-line no-throw-literal
  throw '[copy] Cannot find available clipboard or fake-clipboard.'
}
