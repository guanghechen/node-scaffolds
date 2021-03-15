import fs from 'fs-extra'
import path from 'path'
import type { NpmPackageData } from '../src'
import { testPlop } from '../src'

const initialCwd = process.cwd()
const outputDir = path.join(__dirname, 'output')

beforeEach(async function () {
  jest.setTimeout(10000)
  process.chdir(outputDir)
})

afterEach(async function () {
  fs.emptyDirSync(outputDir)
  process.chdir(initialCwd)
})

describe('runPlop', function () {
  const templateDir = path.join(__dirname, 'fixtures/simple')
  const templateConfig = path.join(templateDir, 'plop.js')

  async function runTest(
    plopBypass: string[],
    mockInputs: string[],
    defaultAnswers: Record<string, unknown>,
    expectedPromptsAnswers: NpmPackageData & any,
  ): Promise<void> {
    const spy = jest.spyOn(console, 'debug').mockImplementation()

    await testPlop(templateConfig, plopBypass, mockInputs, defaultAnswers)

    expect(spy).toHaveBeenCalledWith('promptsAnswers:', expectedPromptsAnswers)

    const targetDir = path.resolve(expectedPromptsAnswers.packageLocation)
    expect(fs.existsSync(path.join(targetDir, 'src/index.ts'))).toBeTruthy()
    expect(fs.existsSync(path.join(targetDir, 'rollup.config.js'))).toBeTruthy()
    expect(fs.existsSync(path.join(targetDir, 'tsconfig.json'))).toBeTruthy()
    expect(
      fs.existsSync(path.join(targetDir, 'tsconfig.settings.json')),
    ).toBeTruthy()
    expect(
      fs.existsSync(path.join(targetDir, 'tsconfig.src.json')),
    ).toBeTruthy()
    expect(fs.existsSync(path.join(targetDir, 'README.md'))).toBeTruthy()

    spy.mockRestore()
  }

  test('simple', async function () {
    const defaultAnswers = { nickname: 'jojo', isMonorepo: false }
    await runTest(
      ['@guanghechen/waw'],
      ['', '', 'some descriptions', ''],
      defaultAnswers,
      {
        ...defaultAnswers,
        cwd: process.cwd(),
        isMonorepo: true,
        packageName: '@guanghechen/waw',
        packageAuthor: 'guanghechen',
        packageVersion: '1.0.0-alpha',
        packageDescription: 'Some Descriptions',
        packageLocation: 'packages/waw',
        packageUsage: 'Some Descriptions.',
        repositoryName: 'guanghechen',
        repositoryHomepage:
          'https://github.com/guanghechen/guanghechen/tree/master/packages/waw#readme',
        toolPackageVersion: '1.0.0-alpha',
      },
    )
  })
})
