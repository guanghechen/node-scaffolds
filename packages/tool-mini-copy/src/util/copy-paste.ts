import { ensureCriticalFilepathExistsSync, isFileSync } from '@guanghechen/file-helper'
import type { FakeClipboard } from '@guanghechen/mini-copy'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { logger } from '../env/logger'
import { copy, paste } from './mini-copy'

export async function copyFromFile(params: {
  filepath: string
  encoding: string
  shouldShowMessage: boolean
  fakeClipboard?: FakeClipboard
}): Promise<void> {
  const { filepath, encoding, shouldShowMessage, fakeClipboard } = params
  ensureCriticalFilepathExistsSync(filepath)
  const content: string = await fs.readFile(filepath, { encoding })
  try {
    await copy(content, { fakeClipboard })
    if (shouldShowMessage) logger.info(`copied from ${filepath}.`)
  } catch (error) {
    if (typeof error === 'string') logger.error(error)
    else throw error
  }
}

export async function copyFromStdin(params: {
  encoding: BufferEncoding
  shouldShowMessage: boolean
  fakeClipboard?: FakeClipboard
}): Promise<void> {
  const { encoding, shouldShowMessage, fakeClipboard } = params
  const content: string = await new Promise<string>((resolve, reject) => {
    let ret = ''
    const stdin = process.stdin

    if (stdin.isTTY) return void resolve(ret)
    stdin
      .setEncoding(encoding)
      .on('readable', () => {
        for (let chunk; ; ret += chunk) {
          chunk = stdin.read()
          if (chunk == null) break
        }
      })
      .on('end', () => {
        resolve(ret.replace(/^([^]*?)(?:\r\n|\n\r|[\n\r])$/, '$1'))
      })
      .on('error', error => {
        reject(error)
      })
  })

  try {
    await copy(content, { fakeClipboard })
    if (shouldShowMessage) logger.info(`copied into system clipboard.`)
  } catch (error) {
    if (typeof error === 'string') logger.error(error)
    else throw error
  }
}

export async function pasteToFile(params: {
  filepath: string
  encoding: BufferEncoding
  force: boolean
  shouldShowMessage: boolean
  fakeClipboard?: FakeClipboard
}): Promise<void> {
  const { filepath, encoding, force, shouldShowMessage, fakeClipboard } = params
  if (fs.existsSync(filepath)) {
    if (!isFileSync(filepath)) {
      if (shouldShowMessage) logger.error(`${filepath} is not a file.`)
      return
    }

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

  try {
    const content: string = await paste({ fakeClipboard })
    await fs.writeFile(filepath, content, { encoding })
    if (shouldShowMessage) logger.info(`pasted into ${filepath}.`)
  } catch (error) {
    if (typeof error === 'string') logger.error(error)
    else throw error
  }
}

export async function pasteToStdout(params: {
  encoding: BufferEncoding
  fakeClipboard?: FakeClipboard
}): Promise<void> {
  const { encoding, fakeClipboard } = params
  try {
    const content: string = (await paste({ fakeClipboard })) || ''
    await new Promise(resolve => process.stdout.write(content, encoding, resolve))
  } catch (error) {
    if (typeof error === 'string') logger.error(error)
    else throw error
  }
}
