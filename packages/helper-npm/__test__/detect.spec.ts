import { locateNearestFilepath } from '@guanghechen/locate-helper'
import fs from 'fs-extra'
import { locateFixtures } from 'jest.helper'
import { detectMonorepo, detectPackageAuthor } from '../src'

describe('detectMonorepo', () => {
  test('basic', async () => {
    expect(detectMonorepo(__dirname)).toBeTruthy()

    const lernaFilepath = locateNearestFilepath(__dirname, 'lerna.json')
    const bakFilepath = lernaFilepath + '.bak'

    if (lernaFilepath != null) {
      fs.moveSync(lernaFilepath, bakFilepath)
    }

    try {
      expect(detectMonorepo(locateFixtures('monorepo1'))).toBeTruthy()
      expect(detectMonorepo(locateFixtures('monorepo2'))).toBeTruthy()
      expect(detectMonorepo(locateFixtures('normal-repo'))).toBeFalsy()
    } finally {
      if (lernaFilepath != null) {
        fs.moveSync(bakFilepath, lernaFilepath)
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
