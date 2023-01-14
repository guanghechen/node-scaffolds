// eslint-disable-next-line import/no-extraneous-dependencies
import { name, version } from '@guanghechen/tool-git-cipher/package.json' assert { type: 'json' }
import path from 'node:path'
import url from 'node:url'

export const COMMAND_NAME = 'ghc-git-cipher'
export const COMMAND_VERSION: string = version
export const PACKAGE_NAME: string = name

// Config files root dir
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')
