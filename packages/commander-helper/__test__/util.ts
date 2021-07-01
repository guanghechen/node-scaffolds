import type { Desensitizer } from '@guanghechen/jest-helper'
import {
  composeStringDesensitizers,
  createFilepathDesensitizer,
  createJsonDesensitizer,
} from '@guanghechen/jest-helper'
import fs from 'fs-extra'
import path from 'path'

export const locateFixtures = (...p: string[]): string =>
  path.join(__dirname, 'fixtures', ...p)

export const loadFixtures = (...p: string[]): string =>
  fs.readFileSync(locateFixtures(...p), 'utf-8')

const workspaceRootDir = path.resolve(__dirname, '../../../')
export const desensitize: Desensitizer<any> & Desensitizer<string> =
  createJsonDesensitizer({
    string: composeStringDesensitizers(
      createFilepathDesensitizer(workspaceRootDir, '<$WORKSPACE$>'),
      text => text.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, '<$Date$>'),
    ),
  }) as Desensitizer<any>
