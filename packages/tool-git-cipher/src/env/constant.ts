// eslint-disable-next-line import/no-extraneous-dependencies
import manifest from '@guanghechen/tool-git-cipher/package.json' assert { type: 'json' }
import path from 'node:path'
import url from 'node:url'

export const COMMAND_NAME = 'ghc-git-cipher'
export const COMMAND_VERSION: string = manifest.version
export const PACKAGE_NAME: string = manifest.name

// Config files root dir
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')
