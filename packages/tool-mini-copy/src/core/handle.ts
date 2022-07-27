import { readFromStdin } from '@guanghechen/commander-helper'
import { ensureCriticalFilepathExistsSync } from '@guanghechen/file-helper'
import { FakeClipboard } from '@guanghechen/mini-copy'
import fs from 'fs-extra'
import { logger } from '../env/logger'
import type { ISafeCopyOptions } from '../util/copy-paste'
import { pasteToFile, pasteToStdout, safeCopy } from '../util/copy-paste'
import type { GlobalCommandOptions } from './option'

export async function handleCommand(
  sourceContent: string | null,
  options: GlobalCommandOptions,
): Promise<void> {
  const {
    encoding,
    input: inputFilepath,
    output: outputFilepath,
    fakeClipboard: fakeClipboardPath,
    force,
    silence,
    stripAnsi: shouldStripAnsi,
  } = options
  const fakeClipboard: FakeClipboard | undefined = fakeClipboardPath
    ? new FakeClipboard({ filepath: fakeClipboardPath, logger })
    : undefined

  let copied: 'argument' | 'stdin' | 'file' | false = false
  let pasted: 'file' | 'stdout' | false = false

  const safeCopyOptions: Omit<ISafeCopyOptions, 'from'> = {
    silence,
    shouldStripAnsi,
    fakeClipboard,
  }

  // Copy from argument.
  if (!copied && sourceContent != null) {
    await safeCopy(sourceContent, { ...safeCopyOptions, from: 'argument' })
    copied = 'argument'
  }

  // Copy from file.
  if (!copied && inputFilepath != null) {
    ensureCriticalFilepathExistsSync(inputFilepath)
    const fileContent: string = await fs.readFile(inputFilepath, { encoding })
    await safeCopy(fileContent, { ...safeCopyOptions, from: `file(${inputFilepath})` })
    copied = 'stdin'
  }

  // Copy from stdin.
  if (!copied && !process.stdin.isTTY && process.env.STDIN != '0') {
    const stdinContent = await readFromStdin(encoding)
    if (stdinContent) {
      await safeCopy(stdinContent, { ...safeCopyOptions, from: 'stdin' })
      copied = 'file'
    }
  }

  // Paste to file.
  if (!pasted && outputFilepath != null) {
    // FIXME: resolve inquire.prompt when there are stdin pipeline content.
    if (copied !== 'stdin' || force) {
      logger.debug(`paste to ${outputFilepath}.`)
      await pasteToFile({
        filepath: outputFilepath,
        encoding,
        force,
        silence,
        shouldStripAnsi,
        fakeClipboard,
      })
    }
    pasted = 'file'
  }

  // Paste to stdout.
  if (!copied && !pasted) {
    logger.debug(`paste to stdout.`)
    await pasteToStdout({
      encoding,
      shouldStripAnsi,
      fakeClipboard,
    })
    pasted = 'stdout'
  }
}
