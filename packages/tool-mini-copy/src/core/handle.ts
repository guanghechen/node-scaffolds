import { FakeClipboard } from '@guanghechen/mini-copy'
import stripAnsi from 'strip-ansi'
import { logger } from '../env/logger'
import { copyFromFile, copyFromStdin, pasteToFile, pasteToStdout } from '../util/copy-paste'
import { copy } from '../util/mini-copy'
import type { GlobalCommandOptions } from './option'

export async function handleCommand(
  sourceContent: string,
  options: GlobalCommandOptions,
): Promise<void> {
  const { encoding, input, output, fakeClipboard: fakeClipboardPath, force, silence } = options
  const fakeClipboard: FakeClipboard | undefined = fakeClipboardPath
    ? new FakeClipboard({ filepath: fakeClipboardPath, logger })
    : undefined

  // Copy content to clipboard
  if (sourceContent) {
    // copy from sourceContent
    logger.debug(`copy from argument.`)
    const value = options.stripAnsi ? stripAnsi(sourceContent) : sourceContent
    await copy(value, { fakeClipboard })
    if (!silence) logger.info(`copied into system clipboard.`)
  }

  let copied = !!sourceContent

  // if filepath is not exist, print the content of the system clipboard to the terminal
  // thanks to https://github.com/sindresorhus/clipboard-cli
  if (process.stdin.isTTY || process.env.STDIN === '0' || force || input != null) {
    // copy from file
    if (!copied && input) {
      logger.debug(`copy from ${input}.`)
      await copyFromFile({
        filepath: input,
        encoding,
        shouldShowMessage: !silence,
        fakeClipboard,
      })
      copied = true
    }

    // paste to file
    if (output != null) {
      logger.debug(`paste to ${output}.`)
      await pasteToFile({
        filepath: output,
        encoding,
        force,
        shouldShowMessage: !silence,
        fakeClipboard,
      })
      return
    }

    // paste to stdout
    if (!copied) {
      logger.debug(`paste to stdout.`)
      await pasteToStdout({
        encoding,
        fakeClipboard,
      })
      return
    }
  }

  if (!copied) {
    // copy data from stdin
    logger.debug(`copy from stdin.`)
    await copyFromStdin({
      encoding,
      shouldShowMessage: !silence,
      fakeClipboard,
    })
  }
}
