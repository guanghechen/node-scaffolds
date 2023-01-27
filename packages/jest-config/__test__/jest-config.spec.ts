import path from 'node:path'
import url from 'node:url'
import { resolveModuleNameMapper, tsMonorepoConfig } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const originalCwd = process.cwd()
afterEach(() => {
  process.chdir(originalCwd)
})

const resolveFixturePath = (p: string): string => path.join(__dirname, 'fixtures', p)
const desensitizeModuleNameMapper = (
  moduleNameMapper: Record<string, string | string[]> | undefined,
): Record<string, string> => {
  const result = {}
  if (moduleNameMapper) {
    for (const key of Object.keys(moduleNameMapper)) {
      const values = moduleNameMapper[key]
      if (Array.isArray(values)) {
        result[key] = values.map(p => '<WORKSPACE>/' + path.relative(__dirname, p))
      } else {
        result[key] = '<WORKSPACE>/' + path.relative(__dirname, values)
      }
    }
  }
  return result
}

describe('resolveModuleNameMapper', function () {
  test('basic', async function () {
    const moduleNameMapper = await resolveModuleNameMapper(resolveFixturePath('basic'))
    expect(desensitizeModuleNameMapper(moduleNameMapper)).toMatchSnapshot('basic')
  })

  test('custom tsconfig name', async function () {
    const moduleNameMapper = await resolveModuleNameMapper(
      resolveFixturePath('custom-tsconfig-name'),
      'tsconfig.src.json',
    )
    expect(desensitizeModuleNameMapper(moduleNameMapper)).toMatchSnapshot('custom-tsconfig-name')
  })

  test('empty', async function () {
    const moduleNameMapper = await resolveModuleNameMapper(resolveFixturePath('empty'))
    expect(moduleNameMapper).toEqual({})
  })

  test('not exists', async function () {
    const moduleNameMapper = await resolveModuleNameMapper(
      resolveFixturePath('empty'),
      'tsconfig.json',
    )
    expect(moduleNameMapper).toEqual({})
  })
})

test('tsMonorepoConfig', async function () {
  const rootDir = resolveFixturePath('basic')
  process.chdir(rootDir)
  const config = await tsMonorepoConfig(rootDir)
  config.moduleNameMapper = desensitizeModuleNameMapper(config.moduleNameMapper)
  expect(config).toMatchSnapshot()
})
