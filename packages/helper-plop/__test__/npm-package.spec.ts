import { desensitize } from 'jest.helper'
import type { INpmPackagePreAnswers, INpmPackagePromptsAnswers } from '../src'
import { resolveNpmPackageAnswers } from '../src'

describe('resolveNpmPackageAnswers', function () {
  const preAnswers: INpmPackagePreAnswers = {
    cwd: __dirname,
    isMonorepo: false,
  }

  test('empty author', function () {
    const answers: INpmPackagePromptsAnswers = {
      packageName: '@guanghechen/waw-helper',
      packageAuthor: '',
      packageVersion: '1.0.0',
      packageDescription: '',
      packageLocation: 'waw-helper',
    }

    expect(desensitize(resolveNpmPackageAnswers(preAnswers, answers))).toMatchObject({
      cwd: '<$WORKSPACE$>/packages/helper-plop/__test__',
      isMonorepo: false,
      packageAuthor: 'guanghechen',
      packageDescription: '',
      packageLocation: 'waw-helper',
      packageName: '@guanghechen/waw-helper',
      packageUsage: '',
      packageVersion: '1.0.0',
      repositoryHomepage: 'https://github.com/guanghechen/waw-helper#readme',
      repositoryName: 'waw-helper',
    })
  })
})
