const path = require('path')
const { resolveModuleNameMapper, tsMonorepoConfig } = require('..')

const originalCwd = process.cwd()
afterEach(() => {
  process.chdir(originalCwd)
})

const resolveFixturePath = p => path.join(__dirname, 'fixtures', p)
const desensitizeModuleNameMapper = moduleNameMapper => {
  const result = {}
  for (const key of Object.keys(moduleNameMapper)) {
    if (Array.isArray(moduleNameMapper[key])) {
      result[key] = moduleNameMapper[key].map(
        p => '<WORKSPACE>/' + path.relative(__dirname, p),
      )
    } else {
      result[key] =
        '<WORKSPACE>/' + path.relative(__dirname, moduleNameMapper[key])
    }
  }
  return result
}

describe('resolveModuleNameMapper', function () {
  test('basic', function () {
    expect(
      desensitizeModuleNameMapper(
        resolveModuleNameMapper(resolveFixturePath('basic')),
      ),
    ).toMatchSnapshot('basic')
  })

  test('custom tsconfig name', function () {
    expect(
      desensitizeModuleNameMapper(
        resolveModuleNameMapper(
          resolveFixturePath('custom-tsconfig-name'),
          'tsconfig.src.json',
        ),
      ),
    ).toMatchSnapshot('custom-tsconfig-name')
  })

  test('empty', function () {
    expect(resolveModuleNameMapper(resolveFixturePath('empty'))).toEqual({})
  })

  test('not exists', function () {
    expect(
      resolveModuleNameMapper(resolveFixturePath('empty'), 'tsconfig.json'),
    ).toEqual({})
  })
})

test('tsMonorepoConfig', function () {
  const rootDir = resolveFixturePath('basic')
  process.chdir(rootDir)
  const config = tsMonorepoConfig(rootDir)
  config.moduleNameMapper = desensitizeModuleNameMapper(config.moduleNameMapper)
  expect(config).toMatchSnapshot()
})
