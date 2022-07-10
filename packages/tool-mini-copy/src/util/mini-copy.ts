import { copy as realCopy, paste as realPaste } from '@guanghechen/mini-copy'
import type { ICopyOptions, IPasteOptions } from '@guanghechen/mini-copy'
import fs from 'fs-extra'
import { logger } from '../env/logger'

interface ICommandItem {
  path: string
  args?: string[]
}

/**
 * Write content into system clipboard.
 * @param content           the content you want to write into system clipboard.
 * @param copyOptions
 * @param copyCommandItem
 */
export const copy = async (
  content: string,
  copyOptions: Partial<ICopyOptions> = {},
  copyCommandItem?: ICommandItem,
): Promise<void> => {
  const options: ICopyOptions = { ...copyOptions }
  if (copyCommandItem == null) {
    options.copyCommandPath = defaultCopyCommandItem.path
    options.copyCommandArgs = defaultCopyCommandItem.args || []
  } else {
    options.copyCommandPath = copyCommandItem.path
    options.copyCommandArgs = copyCommandItem.args || []
  }
  options.logger = options.logger ?? logger
  await realCopy(content, options)
}

/**
 * Read the data from system clipboard
 * @param pasteOptions
 * @param pasteCommandItem
 */
export const paste = async (
  pasteOptions: Partial<IPasteOptions> = {},
  pasteCommandItem?: ICommandItem,
): Promise<string> => {
  const options: IPasteOptions = { ...pasteOptions }
  if (pasteCommandItem == null) {
    options.pasteCommandPath = defaultPasteCommandItem.path
    options.pasteCommandArgs = defaultPasteCommandItem.args || []
  } else {
    options.pasteCommandPath = pasteCommandItem.path
    options.pasteCommandArgs = pasteCommandItem.args || []
  }
  options.logger = options.logger ?? logger
  return realPaste(pasteOptions)
}

const defaultCopyCommandItem: ICommandItem =
  [
    { path: '/mnt/c/Windows/System32/clip.exe' },
    { path: '/c/Windows/System32/clip.exe' },
    { path: 'C:\\Windows\\System32\\clip.exe' },
    { path: '/mnt/d/clipboard.exe', args: ['--copy'] },
    { path: '/d/clipboard.exe', args: ['--copy'] },
    { path: 'D:\\clipboard.exe', args: ['--copy'] },
    { path: '/mnt/e/clipboard.exe', args: ['--copy'] },
    { path: '/e/clipboard.exe', args: ['--copy'] },
    { path: 'E:\\clipboard.exe', args: ['--copy'] },
    { path: '/mnt/f/clipboard.exe', args: ['--copy'] },
    { path: '/f/clipboard.exe', args: ['--copy'] },
    { path: 'F:\\clipboard.exe', args: ['--copy'] },
    { path: '/mnt/G/clipboard.exe', args: ['--copy'] },
    { path: '/g/clipboard.exe', args: ['--copy'] },
    { path: 'G:\\clipboard.exe', args: ['--copy'] },
  ].filter(p => fs.existsSync(p.path))[0] || {}

const defaultPasteCommandItem: ICommandItem =
  [
    {
      path: '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
      args: ['-Command', 'Get-Clipboard'],
    },
    {
      path: '/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
      args: ['-Command', 'Get-Clipboard'],
    },
    {
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      args: ['-Command', 'Get-Clipboard'],
    },
    { path: '/mnt/d/clipboard.exe', args: ['--paste'] },
    { path: '/d/clipboard.exe', args: ['--paste'] },
    { path: 'D:\\clipboard.exe', args: ['--paste'] },
    { path: '/mnt/e/clipboard.exe', args: ['--paste'] },
    { path: '/e/clipboard.exe', args: ['--paste'] },
    { path: 'E:\\clipboard.exe', args: ['--paste'] },
    { path: '/mnt/f/clipboard.exe', args: ['--paste'] },
    { path: '/f/clipboard.exe', args: ['--paste'] },
    { path: 'F:\\clipboard.exe', args: ['--paste'] },
    { path: '/mnt/G/clipboard.exe', args: ['--paste'] },
    { path: '/g/clipboard.exe', args: ['--paste'] },
    { path: 'G:\\clipboard.exe', args: ['--paste'] },
  ].filter(p => fs.existsSync(p.path))[0] || {}
