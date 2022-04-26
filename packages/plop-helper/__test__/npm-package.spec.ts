import { desensitize } from 'jest.helper'
import type { NpmPackagePreAnswers, NpmPackagePromptsAnswers } from '../src'
import { resolveNpmPackageAnswers } from '../src'

describe('resolveNpmPackageAnswers', function () {
  const preAnswers: NpmPackagePreAnswers = {
    cwd: __dirname,
    isMonorepo: false,
  }

  test('empty author', function () {
    const answers: NpmPackagePromptsAnswers = {
      packageName: '@guanghechen/waw-helper',
      packageAuthor: '',
      packageVersion: '1.0.0',
      packageDescription: '',
      packageLocation: 'waw-helper',
    }

    expect(desensitize(resolveNpmPackageAnswers(preAnswers, answers))).toMatchObject({
      cwd: '<$WORKSPACE$>/packages/plop-helper/__test__',
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
