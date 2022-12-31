// eslint-disable-next-line import/no-extraneous-dependencies
import manifest from '@guanghechen/tool-mini-copy/package.json' assert { type: 'json' }

export const COMMAND_NAME = 'mcp'
export const COMMAND_VERSION: string = manifest.version
export const PACKAGE_NAME: string = manifest.name
