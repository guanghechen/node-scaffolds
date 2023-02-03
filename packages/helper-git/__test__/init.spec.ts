import { emptyDir, rm } from '@guanghechen/helper-fs'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { locateFixtures } from 'jest.helper'
import { initGitRepo, isGitRepo } from '../src'

describe('init', () => {
  const workspaceDir: string = locateFixtures('__fictitious__init')

  let logMock: IConsoleMock
  beforeEach(async () => {
    logMock = createConsoleMock(['error'])
    await emptyDir(workspaceDir)
  })
  afterEach(async () => {
    logMock.restore()
    await rm(workspaceDir)
  })

  describe('initGitRepo', () => {
    test('basic', async () => {
      expect(isGitRepo(workspaceDir)).toEqual(false)
      await initGitRepo({
        cwd: workspaceDir,
        authorName: 'guanghechen',
        authorEmail: 'example@gmail.com',
      })
      expect(isGitRepo(workspaceDir)).toEqual(true)
    })

    test('custom defaultBranch', async () => {
      expect(isGitRepo(workspaceDir)).toEqual(false)
      await initGitRepo({
        cwd: workspaceDir,
        defaultBranch: 'main',
        authorName: 'guanghechen',
        authorEmail: 'example@gmail.com',
      })
      expect(isGitRepo(workspaceDir)).toEqual(true)
    })
  })
})
