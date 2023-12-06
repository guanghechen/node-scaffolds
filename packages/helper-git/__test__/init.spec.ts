// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type { IReporterMock } from '@guanghechen/helper-jest'
import { createReporterMock } from '@guanghechen/helper-jest'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { emptyDir, locateFixtures, rm } from 'jest.helper'
import { initGitRepo, isGitRepo } from '../src'

describe('init', () => {
  const workspaceDir: string = locateFixtures('__fictitious__init')
  const reporter = new Reporter(chalk, {
    baseName: 'init',
    level: ReporterLevelEnum.ERROR,
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
    it('basic', async () => {
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

    it('custom defaultBranch', async () => {
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
