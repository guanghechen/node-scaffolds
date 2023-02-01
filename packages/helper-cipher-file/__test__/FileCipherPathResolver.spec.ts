import { emptyDir, rm } from '@guanghechen/helper-fs'
import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import { FileCipherPathResolver } from '../src'

describe('FileCipherPathResolver', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherPathResolver')
  const plainRootDir = path.join(workspaceDir, 'src')
  const cryptRootDir = path.join(workspaceDir, 'src_encrypted')
  const pathResolver = new FileCipherPathResolver({
    plainRootDir: plainRootDir,
    cryptRootDir: cryptRootDir,
  })

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('calcAbsolutePlainFilepath', () => {
    expect(pathResolver.calcAbsolutePlainFilepath('waw.txt')).toEqual(
      path.join(plainRootDir, 'waw.txt'),
    )

    expect(pathResolver.calcAbsolutePlainFilepath(path.join(plainRootDir, 'waw2.txt'))).toEqual(
      path.join(plainRootDir, 'waw2.txt'),
    )

    expect(() => pathResolver.calcAbsolutePlainFilepath('/waw.txt')).toThrow(
      /Not under the plainRootDir:/,
    )
  })

  test('calcAbsoluteCryptFilepath', () => {
    expect(pathResolver.calcAbsoluteCryptFilepath('waw.txt')).toEqual(
      path.join(cryptRootDir, 'waw.txt'),
    )

    expect(pathResolver.calcAbsoluteCryptFilepath(path.join(cryptRootDir, 'waw2.txt'))).toEqual(
      path.join(cryptRootDir, 'waw2.txt'),
    )

    expect(() => pathResolver.calcAbsoluteCryptFilepath('/waw.txt')).toThrow(
      /Not under the cryptRootDir:/,
    )
  })

  test('calcRelativePlainFilepath', () => {
    expect(pathResolver.calcRelativePlainFilepath(path.join(plainRootDir, 'waw.txt'))).toEqual(
      'waw.txt',
    )

    expect(() => pathResolver.calcRelativePlainFilepath('/waw.txt')).toThrow(
      /Not under the plainRootDir:/,
    )
  })

  test('calcRelativeCryptFilepath', () => {
    expect(pathResolver.calcRelativeCryptFilepath(path.join(cryptRootDir, 'waw.txt'))).toEqual(
      'waw.txt',
    )

    expect(() => pathResolver.calcRelativeCryptFilepath('/waw.txt')).toThrow(
      /Not under the cryptRootDir:/,
    )
  })
})
