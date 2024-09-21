import { desensitize, locateFixtures } from 'jest.helper'
import { collectAllFiles, collectAllFilesSync } from '../src'

describe('collectAllFiles', () => {
  test('default predicate', async () => {
    expect(desensitize(await collectAllFiles(locateFixtures('basic')))).toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/1.md",
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/2.md",
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)
  })

  test('yaml file only', async () => {
    expect(
      desensitize(await collectAllFiles(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)

    expect(
      desensitize(
        await collectAllFiles(locateFixtures('basic'), p =>
          Promise.resolve(/\.(?:yml|yaml)$/.test(p)),
        ),
      ),
    ).toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)
  })

  test('collect start from file', async () => {
    expect(desensitize(await collectAllFiles(locateFixtures('basic/config.yml'))))
      .toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)
  })
})

describe('collectAllFilesSync', () => {
  test('default predicate', () => {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic')))).toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/1.md",
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/2.md",
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)
  })

  test('yaml file only', () => {
    expect(
      desensitize(collectAllFilesSync(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)
  })

  test('collect start from file', () => {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic/config.yml'))))
      .toMatchInlineSnapshot(`
      [
        "<$WORKSPACE$>/packages/fs/__test__/fixtures/basic/config.yml",
      ]
    `)
  })
})
