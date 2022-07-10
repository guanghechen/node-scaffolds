import { FakeClipboard } from '@guanghechen/mini-copy'
import path from 'path'
import type { GlobalCommandOptions } from '.'
import {
  __defaultGlobalCommandOptions,
  copy,
  copyFromFile,
  copyFromStdin,
  createProgram,
  logger,
  packageName,
  pasteToFile,
  pasteToStdout,
  resolveGlobalCommandOptions,
} from '.'

const program = createProgram()

program
  .action(async function (args: string[], options: GlobalCommandOptions): Promise<void> {
    const resolvedOptions = resolveGlobalCommandOptions(
      packageName,
      '',
      __defaultGlobalCommandOptions,
      path.resolve(),
      options,
    )
    const {
      encoding,
      input,
      output,
      fakeClipboard: fakeClipboardPath,
      force,
      silence,
    } = resolvedOptions
    const fakeClipboard: FakeClipboard | undefined = fakeClipboardPath
      ? new FakeClipboard({ filepath: fakeClipboardPath, logger })
      : undefined

    const sourceContent = args[0]

    // if filepath is not exist, print the content of the system clipboard to the terminal
    // thanks to https://github.com/sindresorhus/clipboard-cli
    if (sourceContent == null) {
      if (process.stdin.isTTY || process.env.STDIN === '0' || force || input != null) {
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

        if (force) {
          // paste to stdout
          logger.debug(`paste to stdout.`)
          await pasteToStdout({
            encoding,
            fakeClipboard,
          })
          return
        }

        // copy from file
        if (input != null) {
          logger.debug(`copy from ${input}.`)
          await copyFromFile({
            filepath: input,
            encoding,
            shouldShowMessage: !silence,
            fakeClipboard,
          })
          return
        }

        // paste to stdout
        logger.debug(`paste to stdout.`)
        await pasteToStdout({
          encoding,
          fakeClipboard,
        })
        return
      }

      // copy data from stdin
      logger.debug(`copy from stdin.`)
      await copyFromStdin({
        encoding,
        shouldShowMessage: !silence,
        fakeClipboard,
      })
      return
    }

    // copy from sourceContent
    logger.debug(`copy from argument.`)
    await copy(sourceContent, { fakeClipboard })
    if (!silence) logger.info(`copied into system clipboard.`)
  })
  .parse(process.argv)
