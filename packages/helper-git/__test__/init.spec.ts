import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import type { IReporterMock } from '@guanghechen/helper-jest'
import { createReporterMock } from '@guanghechen/helper-jest'
import { emptyDir, locateFixtures, rm } from 'jest.helper'
import { initGitRepo, isGitRepo } from '../src'

describe('init', () => {
  const workspaceDir: string = locateFixtures('__fictitious__init')
  const reporter = new ChalkLogger({
    name: 'init',
    level: Level.ERROR,
    flights: { inline: true, colorful: false },
  })

  let logMock: IReporterMock
  beforeEach(async () => {
    logMock = createReporterMock({ reporter })
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
        gpgSign: false,
        reporter,
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
        gpgSign: false,
        reporter,
      })
      expect(isGitRepo(workspaceDir)).toEqual(true)
    })
  })
})
