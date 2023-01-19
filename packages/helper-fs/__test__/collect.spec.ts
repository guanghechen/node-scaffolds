import { desensitize, locateFixtures } from 'jest.helper'
import { collectAllFiles, collectAllFilesSync } from '../src'

describe('collectAllFiles', () => {
  test('default predicate', async () => {
    expect(desensitize(await collectAllFiles(locateFixtures('basic')))).toMatchSnapshot()
  })

  test('yaml file only', async () => {
    expect(
      desensitize(await collectAllFiles(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchSnapshot()

    expect(
      desensitize(
        await collectAllFiles(locateFixtures('basic'), p =>
          Promise.resolve(/\.(?:yml|yaml)$/.test(p)),
        ),
      ),
    ).toMatchSnapshot()
  })

  test('collect start from file', async () => {
    expect(desensitize(await collectAllFiles(locateFixtures('basic/config.yml')))).toMatchSnapshot()
  })
})

describe('collectAllFilesSync', () => {
  test('default predicate', () => {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic')))).toMatchSnapshot()
  })

  test('yaml file only', () => {
    expect(
      desensitize(collectAllFilesSync(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchSnapshot()
  })

  test('collect start from file', () => {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic/config.yml')))).toMatchSnapshot()
  })
})
