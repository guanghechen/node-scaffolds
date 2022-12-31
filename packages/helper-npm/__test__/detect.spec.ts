import { locateNearestFilepath } from '@guanghechen/helper-path'
import { locateFixtures } from 'jest.helper'
import fs from 'node:fs'
import url from 'node:url'
import { detectMonorepo, detectPackageAuthor } from '../src'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

describe('detectMonorepo', () => {
  test('basic', async () => {
    expect(detectMonorepo(__dirname)).toBeTruthy()

    const lernaFilepath = locateNearestFilepath(__dirname, 'lerna.json')
    const bakFilepath = lernaFilepath + '.bak'

    if (lernaFilepath != null) {
      fs.copyFileSync(lernaFilepath, bakFilepath)
      fs.unlinkSync(lernaFilepath)
    }

    try {
      expect(detectMonorepo(locateFixtures('monorepo1'))).toBeTruthy()
      expect(detectMonorepo(locateFixtures('monorepo2'))).toBeTruthy()
      expect(detectMonorepo(locateFixtures('normal-repo'))).toBeFalsy()
    } finally {
      if (lernaFilepath != null) {
        fs.copyFileSync(bakFilepath, lernaFilepath)
        fs.unlinkSync(bakFilepath)
      }
    }
  })
})

describe('detectPackageAuthor', () => {
  test('basic', () => {
    expect(detectPackageAuthor(__dirname)).toEqual('guanghechen')
    expect(detectPackageAuthor(locateFixtures('monorepo1'))).toEqual('guanghechen')
    expect(detectPackageAuthor(locateFixtures('monorepo2'))).toEqual('waw')
    expect(detectPackageAuthor(locateFixtures('normal-repo'))).toBeNull()
  })
})
