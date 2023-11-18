import { stripAnsi } from '@guanghechen/helper-commander'
import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { FakeClipboard } from '@guanghechen/mini-copy'
import inquirer from 'inquirer'
import fs from 'node:fs'
import { reporter } from '../env/reporter'
import { copy, paste } from './mini-copy'

export interface ISafeCopyOptions {
  from: string
  silence: boolean
  shouldStripAnsi: boolean
  fakeClipboard?: FakeClipboard
}

export async function safeCopy(content: string, options: ISafeCopyOptions): Promise<void> {
  const { from, silence, shouldStripAnsi, fakeClipboard } = options
  const startMessage = `Copying from ${from}.`
  const succeedMessage = fakeClipboard
    ? `Copied into fake clipboard.`
    : `Copied into system clipboard.`

  try {
    reporter.debug(startMessage)
    const value = shouldStripAnsi ? stripAnsi(content) : content
    await copy(value, { fakeClipboard })
    if (silence) reporter.debug(succeedMessage)
    else reporter.info(succeedMessage)
  } catch (error) {
    if (typeof error === 'string') reporter.error(error)
    else throw error
  }
}

export interface ISafePasteOptions {
  to: string
  silence: boolean
  shouldStripAnsi: boolean
  fakeClipboard?: FakeClipboard
}

export async function safePaste(
  write: (content: string) => Promise<void>,
  options: ISafePasteOptions,
): Promise<void> {
  const { to, silence, shouldStripAnsi, fakeClipboard } = options
  const startMessage = fakeClipboard
    ? `Reading from fake clipboard`
    : `Reading from system clipboard`
  const succeedMessage = `Pasted into ${to}.`

  try {
    reporter.debug(startMessage)
    const content: string = await paste({ fakeClipboard })
    const value = shouldStripAnsi ? stripAnsi(content) : content
    await write(value)
    if (silence) reporter.debug(succeedMessage)
    else reporter.info(succeedMessage)
  } catch (error) {
    if (typeof error === 'string') reporter.error(error)
    else throw error
  }
}

export async function pasteToFile(params: {
  filepath: string
  encoding: BufferEncoding
  force: boolean
  silence: boolean
  shouldStripAnsi: boolean
  fakeClipboard?: FakeClipboard
}): Promise<void> {
  const { filepath, encoding, force, silence, shouldStripAnsi, fakeClipboard } = params
  if (fs.existsSync(filepath)) {
    invariant(isFileSync(filepath), `${filepath} is not a file.`)

    // the filepath is exists, wait for user's confirmation to overwrite it.
    if (!force) {
      const { shouldForceRewrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldForceRewrite',
          default: false,
          message: `Override ${filepath}?`,
        },
      ])
      if (!shouldForceRewrite) return
    }
  }

  await safePaste(async content => fs.writeFileSync(filepath, content, { encoding }), {
    to: `file(${filepath})`,
    silence,
    shouldStripAnsi,
    fakeClipboard,
  })
}

export async function pasteToStdout(params: {
  encoding: BufferEncoding
  shouldStripAnsi: boolean
  fakeClipboard?: FakeClipboard
}): Promise<void> {
  const { encoding, shouldStripAnsi, fakeClipboard } = params
  await safePaste(
    content =>
      new Promise<void>((resolve, reject) =>
        process.stdout.write(content, encoding, err => (err ? reject(err) : resolve())),
      ),
    {
      to: `stdout`,
      silence: true,
      shouldStripAnsi,
      fakeClipboard,
    },
  )
}
