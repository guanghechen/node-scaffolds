import path from 'path'

// eslint-disable-next-line import/no-extraneous-dependencies
export {
  name as packageName,
  version as packageVersion,
} from '@guanghechen/tool-git-cipher/package.json'

// Command name
export const COMMAND_NAME = 'ghc-git-cipher'

// Config files root dir
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')
