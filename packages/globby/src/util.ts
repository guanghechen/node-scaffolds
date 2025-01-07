import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const isNegativePattern = (pattern: string): boolean => pattern[0] === '!'

export const slash = (filepath: string): string => {
  return filepath.replace(/[/\\]+/g, '/')
}

export const toPath = (urlOrPath: string | URL): string => {
  return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath
}

export async function isDirectory(filepath: string): Promise<boolean> {
  if (typeof filepath !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof filepath}`)
  }

  try {
    const stats = await fsPromises.stat(filepath)
    return stats.isDirectory()
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

export function isDirectorySync(filepath: string): boolean {
  if (typeof filepath !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof filepath}`)
  }

  try {
    return fs.statSync(filepath).isDirectory()
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}
