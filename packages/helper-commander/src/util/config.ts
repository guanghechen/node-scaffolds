import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-fs'
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'

export enum ConfigFileType {
  JSON = 'json',
  YAML = 'yaml',
}

export function detectConfigFileType(filepath: string): ConfigFileType | null {
  const extname = path.extname(filepath)
  switch (extname) {
    case '.json':
      return ConfigFileType.JSON
    case '.yml':
    case '.yaml':
      return ConfigFileType.YAML
    default:
      return null
  }
}

export function loadConfig(filepath: string, encoding: BufferEncoding = 'utf8'): unknown | never {
  ensureCriticalFilepathExistsSync(filepath)

  const fileType = detectConfigFileType(filepath)
  if (fileType === null) {
    throw new Error(
      `[loadConfig] Only json / yaml type config files are supported. filepath: (${filepath})`,
    )
  }

  const content: string = fs.readFileSync(filepath, encoding)
  switch (fileType) {
    case ConfigFileType.JSON:
      return JSON.parse(content)
    case ConfigFileType.YAML:
      return yaml.load(content, { filename: filepath, json: true })
    default:
      throw new Error(`[loadConfig] Unexpected fileType (${fileType}). filepath: (${filepath})`)
  }
}
