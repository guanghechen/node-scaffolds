import invariant from '@guanghechen/invariant'
import fs from 'node:fs'
import path from 'node:path'

export enum ConfigFileType {
  JSON = 'json',
}

export function detectConfigFileType(filepath: string): ConfigFileType | null {
  const extname = path.extname(filepath).toLowerCase()
  switch (extname) {
    case '.json':
      return ConfigFileType.JSON
    default:
      return null
  }
}

export function loadConfig(filepath: string, encoding: BufferEncoding = 'utf8'): unknown | never {
  let errMsg: string | null = null

  if (filepath == null) {
    errMsg = `Invalid path: ${filepath}.`
  } else if (!fs.existsSync(filepath!)) {
    errMsg = `Not found: ${filepath}.`
  } else if (!fs.statSync(filepath).isFile()) {
    errMsg = `Not a file: ${filepath}.`
  }

  invariant(errMsg == null, errMsg)

  const fileType = detectConfigFileType(filepath)
  invariant(
    !!fileType,
    `[loadConfig] Only json / yaml type config files are supported. filepath: (${filepath})`,
  )

  const content: string = fs.readFileSync(filepath, encoding)
  switch (fileType) {
    case ConfigFileType.JSON:
      return JSON.parse(content)
    default:
      throw new Error(`[loadConfig] Unexpected fileType (${fileType}). filepath: (${filepath})`)
  }
}
