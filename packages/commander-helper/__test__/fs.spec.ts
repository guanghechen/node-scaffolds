import { desensitize, locateFixtures } from 'jest.setup'
import { collectAllFilesSync, loadJsonOrYaml, loadJsonOrYamlSync } from '../src'

describe('loadJsonOrYaml', function () {
  test('.json', async function () {
    expect(
      await loadJsonOrYaml(locateFixtures('basic/config.json')),
    ).toMatchSnapshot()
  })

  test('.yml', async function () {
    expect(
      await loadJsonOrYaml(locateFixtures('basic/config.yml')),
    ).toMatchSnapshot()
  })

  test('.yaml', async function () {
    expect(
      await loadJsonOrYaml(locateFixtures('basic/config.yaml')),
    ).toMatchSnapshot()
  })

  test('unknown filetype', async function () {
    await expect(() =>
      loadJsonOrYaml(locateFixtures('basic/config.json-unknown')),
    ).rejects.toThrow(
      'Only files in .json / .yml / .ymal format are supported.',
    )
  })

  test('non existent filepath', async function () {
    await expect(() =>
      loadJsonOrYaml(locateFixtures('basic/config.json-non-exist')),
    ).rejects.toThrow('is an invalid file path')
  })
})

describe('loadJsonOrYamlSync', function () {
  test('.json', function () {
    expect(
      loadJsonOrYamlSync(locateFixtures('basic/config.json')),
    ).toMatchSnapshot()
  })

  test('.yml', function () {
    expect(
      loadJsonOrYamlSync(locateFixtures('basic/config.yml')),
    ).toMatchSnapshot()
  })

  test('.yaml', function () {
    expect(
      loadJsonOrYamlSync(locateFixtures('basic/config.yaml')),
    ).toMatchSnapshot()
  })

  test('unknown filetype', function () {
    expect(() =>
      loadJsonOrYamlSync(locateFixtures('basic/config.json-unknown')),
    ).toThrow('Only files in .json / .yml / .ymal format are supported.')
  })

  test('non existent filepath', function () {
    expect(() =>
      loadJsonOrYamlSync(locateFixtures('basic/config.json-non-exist')),
    ).toThrow('is an invalid file path')
  })
})

describe('collectAllFilesSync', function () {
  test('null predicate', function () {
    expect(
      desensitize(collectAllFilesSync(locateFixtures('basic'), null)),
    ).toMatchSnapshot()
  })

  test('json file only', function () {
    expect(
      desensitize(
        collectAllFilesSync(locateFixtures('basic'), p => /\.json$/.test(p)),
      ),
    ).toMatchSnapshot()
  })

  test('collect from file', function () {
    expect(
      desensitize(
        collectAllFilesSync(locateFixtures('basic/config.json'), null),
      ),
    ).toMatchSnapshot()
  })
})
