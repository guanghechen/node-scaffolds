import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { emptyDir, rm } from '@guanghechen/helper-fs'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { locateFixtures } from 'jest.helper'
import type { IGitCommandBaseParams } from '../src'
import { listAllFiles, listDiffFiles, showCommitInfo } from '../src'
import type { ICommitItem } from './_data-repo1'
import { buildRepo1 } from './_data-repo1'

describe('view', () => {
  const workspaceDir: string = locateFixtures('__fictitious__view')
  const logger = new ChalkLogger({
    name: 'view',
    level: Level.ERROR,
    flags: { inline: true },
  })
  const ctx: IGitCommandBaseParams = { cwd: workspaceDir, logger, execaOptions: {} }

  let logMock: IConsoleMock
  beforeEach(async () => {
    logMock = createConsoleMock(['error'])
    await emptyDir(workspaceDir)
  })
  afterEach(async () => {
    logMock.restore()
    await rm(workspaceDir)
  })

  test('listAllFiles', async () => {
    const { commitTable, fpA, fpB, fpC, fpD, fpE } = await buildRepo1({
      repoDir: workspaceDir,
      logger,
      execaOptions: {},
    })

    const eListAllFiles = (commit: ICommitItem): Promise<string[]> =>
      listAllFiles({ ...ctx, branchOrCommitId: commit.commitId })

    expect(await eListAllFiles(commitTable.A)).toEqual([fpA, fpB])
    expect(await eListAllFiles(commitTable.B)).toEqual([fpA, fpB, fpC])
    expect(await eListAllFiles(commitTable.C)).toEqual([fpB, fpC])
    expect(await eListAllFiles(commitTable.D)).toEqual([fpA, fpB, fpC])
    expect(await eListAllFiles(commitTable.E)).toEqual([fpC])
    expect(await eListAllFiles(commitTable.F)).toEqual([fpA, fpC])
    expect(await eListAllFiles(commitTable.G)).toEqual([fpA, fpB, fpC])
    expect(await eListAllFiles(commitTable.H)).toEqual([fpB, fpC])
    expect(await eListAllFiles(commitTable.I)).toEqual([fpA, fpB, fpC, fpD])
    expect(await eListAllFiles(commitTable.J)).toEqual([fpA, fpB, fpC, fpD])
    expect(await eListAllFiles(commitTable.K)).toEqual([fpA, fpB, fpC, fpE])
  })

  test('listDiffFiles', async () => {
    const { commitTable, fpA, fpB, fpC, fpD, fpE } = await buildRepo1({
      repoDir: workspaceDir,
      logger,
      execaOptions: {},
    })

    const eListDiffFiles = (commit: ICommitItem): Promise<string[]> =>
      commit.parentIds.length > 0
        ? listDiffFiles({
            ...ctx,
            branchOrCommitId2: commit.parentIds[0],
            branchOrCommitId1: commit.commitId,
          }).then(md => md.sort())
        : listAllFiles({ ...ctx, branchOrCommitId: commit.commitId }).then(md => md.sort())

    expect(await eListDiffFiles(commitTable.A)).toEqual([fpA, fpB])
    expect(await eListDiffFiles(commitTable.B)).toEqual([fpA, fpC])
    expect(await eListDiffFiles(commitTable.C)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.D)).toEqual([fpA, fpC])
    expect(await eListDiffFiles(commitTable.E)).toEqual([fpB, fpC])
    expect(await eListDiffFiles(commitTable.F)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.G)).toEqual([fpB, fpC])
    expect(await eListDiffFiles(commitTable.H)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.I)).toEqual([fpB, fpD])
    expect(await eListDiffFiles(commitTable.J)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.K)).toEqual([fpD, fpE])
  })

  test('showCommitInfo', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      logger,
      execaOptions: {},
    })

    const assertShowCommitInfo = async (commit: ICommitItem): Promise<void> => {
      const info = await showCommitInfo({
        ...ctx,
        branchOrCommitId: commit.commitId,
        messagePrefix: '    ',
      })
      expect(info).toEqual({
        commitId: commit.commitId,
        authorDate: commit.authorDate,
        authorName: commit.authorName,
        authorEmail: commit.authorEmail,
        committerDate: commit.committerDate,
        committerName: commit.committerName,
        committerEmail: commit.committerEmail,
        message: commit.message,
      })
    }

    await assertShowCommitInfo(commitTable.A)
    await assertShowCommitInfo(commitTable.B)
    await assertShowCommitInfo(commitTable.C)
    await assertShowCommitInfo(commitTable.D)
    await assertShowCommitInfo(commitTable.E)
    await assertShowCommitInfo(commitTable.F)
    await assertShowCommitInfo(commitTable.G)
    await assertShowCommitInfo(commitTable.H)
    await assertShowCommitInfo(commitTable.I)
    await assertShowCommitInfo(commitTable.J)
    await assertShowCommitInfo(commitTable.K)
  })
})
