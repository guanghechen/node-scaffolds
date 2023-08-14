import { locateFixtures } from 'jest.helper'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { detectMonorepo, detectPackageAuthor, locateNearestFilepath } from '../src/index.mjs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

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
    expect(detectPackageAuthor(locateFixtures('normal-repo2'))).toEqual('waw2')
  })
})
