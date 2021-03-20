import {
  composeStringDesensitizers,
  createFilepathDesensitizer,
  createPackageVersionDesensitizer,
  fileSnapshot,
} from '@guanghechen/jest-helper'
import { runPlopWithMock } from '@guanghechen/plop-helper'
import fs from 'fs-extra'
import path from 'path'
import manifest from '../package.json'

const initialCwd = process.cwd()
const outputDir = path.join(__dirname, 'output')

beforeEach(async function () {
  jest.setTimeout(10000)
  if (!fs.existsSync(outputDir)) fs.mkdirpSync(outputDir)
  process.chdir(outputDir)
})

afterEach(async function () {
  fs.removeSync(outputDir)
  process.chdir(initialCwd)
})

const desensitizers = {
  filepath: createFilepathDesensitizer(__dirname),
  packageVersion: createPackageVersionDesensitizer(
    packageVersion => {
      // eslint-disable-next-line jest/no-standalone-expect
      expect(packageVersion).toEqual(manifest.version)
      return '<LATEST>'
    },
    packageName => /^(@guanghechen\/|version$)/.test(packageName),
  ),
}

describe('tsx-package', function () {
  const templateConfig = path.join(__dirname, '../index.js')

  async function runTest(
    plopBypass: string[],
    mockInputs: string[],
    defaultAnswers: Record<string, unknown>,
    expectedPackageLocation: string,
  ): Promise<void> {
    await runPlopWithMock(
      templateConfig,
      plopBypass,
      mockInputs,
      defaultAnswers,
    )

    const targetDir = path.resolve(expectedPackageLocation)
    fileSnapshot(
      targetDir,
      [
        'src/style/index.styl',
        'src/component.tsx',
        'src/index.tsx',
        'rollup.config.js',
        'tsconfig.json',
        'tsconfig.src.json',
      ],
      desensitizers.filepath,
    )

    fileSnapshot(
      targetDir,
      ['package.json', 'README.md'],
      composeStringDesensitizers(
        desensitizers.filepath,
        desensitizers.packageVersion,
      ),
    )
  }

  test('simple', async function () {
    const defaultAnswers = { nickname: 'jojo', isMonorepo: false }
    await runTest(
      ['@guanghechen/waw'],
      ['', '', 'some descriptions', ''],
      defaultAnswers,
      'packages/waw',
    )
  })
})
