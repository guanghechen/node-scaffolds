import { desensitize, locateFixtures } from 'jest.helper'
import { collectAllFiles, collectAllFilesSync } from '../src'

describe('collectAllFiles', function () {
  test('default predicate', async function () {
    expect(desensitize(await collectAllFiles(locateFixtures('basic')))).toMatchSnapshot()
  })

  test('yaml file only', async function () {
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

  test('collect start from file', async function () {
    expect(desensitize(await collectAllFiles(locateFixtures('basic/config.yml')))).toMatchSnapshot()
  })
})

describe('collectAllFilesSync', function () {
  test('default predicate', function () {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic')))).toMatchSnapshot()
  })

  test('yaml file only', function () {
    expect(
      desensitize(collectAllFilesSync(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchSnapshot()
  })

  test('collect start from file', function () {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic/config.yml')))).toMatchSnapshot()
  })
})
