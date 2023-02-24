import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import type { ILoggerMock } from '@guanghechen/helper-jest'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { emptyDir, locateFixtures, rm } from 'jest.helper'
import type { IGitCommandBaseParams, IGitCommitDagNode, IGitCommitWithMessage } from '../src'
import { getCommitInTopology, getCommitWithMessageList } from '../src'
import type { ICommitItem } from './_data-repo1'
import { buildRepo1 } from './_data-repo1'

describe('log', () => {
  const workspaceDir: string = locateFixtures('__fictitious__log')
  const logger = new ChalkLogger({
    name: 'log',
    level: Level.ERROR,
    flights: { inline: true, colorful: false },
  })
  const ctx: IGitCommandBaseParams = { cwd: workspaceDir, logger, execaOptions: {} }

  let logMock: ILoggerMock
  beforeEach(async () => {
    logMock = createLoggerMock({ logger })
    await emptyDir(workspaceDir)
  })
  afterEach(async () => {
    logMock.restore()
    await rm(workspaceDir)
  })

  test('getCommitInTopology', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      logger,
      execaOptions: {},
    })

    const eGetCommitInTopology = (commit: ICommitItem): Promise<IGitCommitDagNode[]> =>
      getCommitInTopology({ ...ctx, commitHash: commit.commitId })

    expect(await eGetCommitInTopology(commitTable.A)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.B)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.C)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.D)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
      { id: commitTable.D.commitId, parents: commitTable.D.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.E)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
      { id: commitTable.E.commitId, parents: commitTable.E.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.F)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
      { id: commitTable.D.commitId, parents: commitTable.D.parentIds },
      { id: commitTable.E.commitId, parents: commitTable.E.parentIds },
      { id: commitTable.F.commitId, parents: commitTable.F.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.G)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.G.commitId, parents: commitTable.G.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.H)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
      { id: commitTable.E.commitId, parents: commitTable.E.parentIds },
      { id: commitTable.G.commitId, parents: commitTable.G.parentIds },
      { id: commitTable.H.commitId, parents: commitTable.H.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.I)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.G.commitId, parents: commitTable.G.parentIds },
      { id: commitTable.I.commitId, parents: commitTable.I.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.J)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
      { id: commitTable.D.commitId, parents: commitTable.D.parentIds },
      { id: commitTable.E.commitId, parents: commitTable.E.parentIds },
      { id: commitTable.F.commitId, parents: commitTable.F.parentIds },
      { id: commitTable.G.commitId, parents: commitTable.G.parentIds },
      { id: commitTable.H.commitId, parents: commitTable.H.parentIds },
      { id: commitTable.I.commitId, parents: commitTable.I.parentIds },
      { id: commitTable.J.commitId, parents: commitTable.J.parentIds },
    ])
    expect(await eGetCommitInTopology(commitTable.K)).toEqual([
      { id: commitTable.A.commitId, parents: commitTable.A.parentIds },
      { id: commitTable.B.commitId, parents: commitTable.B.parentIds },
      { id: commitTable.C.commitId, parents: commitTable.C.parentIds },
      { id: commitTable.D.commitId, parents: commitTable.D.parentIds },
      { id: commitTable.E.commitId, parents: commitTable.E.parentIds },
      { id: commitTable.F.commitId, parents: commitTable.F.parentIds },
      { id: commitTable.G.commitId, parents: commitTable.G.parentIds },
      { id: commitTable.H.commitId, parents: commitTable.H.parentIds },
      { id: commitTable.I.commitId, parents: commitTable.I.parentIds },
      { id: commitTable.J.commitId, parents: commitTable.J.parentIds },
      { id: commitTable.K.commitId, parents: commitTable.K.parentIds },
    ])
  })

  test('getCommitWithMessageList', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      logger,
      execaOptions: {},
    })

    const eGetCommitWithMessageList = (
      branchOrCommitIds: string[],
    ): Promise<IGitCommitWithMessage[]> => getCommitWithMessageList({ ...ctx, branchOrCommitIds })

    expect(await eGetCommitWithMessageList([commitTable.A.commitId])).toEqual([
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.B.commitId])).toEqual([
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.C.commitId])).toEqual([
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.D.commitId])).toEqual([
      { id: commitTable.D.commitId, message: commitTable.D.message },
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.E.commitId])).toEqual([
      { id: commitTable.E.commitId, message: commitTable.E.message },
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.F.commitId])).toEqual([
      { id: commitTable.F.commitId, message: commitTable.F.message },
      { id: commitTable.E.commitId, message: commitTable.E.message },
      { id: commitTable.D.commitId, message: commitTable.D.message },
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.G.commitId])).toEqual([
      { id: commitTable.G.commitId, message: commitTable.G.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.H.commitId])).toEqual([
      { id: commitTable.H.commitId, message: commitTable.H.message },
      { id: commitTable.G.commitId, message: commitTable.G.message },
      { id: commitTable.E.commitId, message: commitTable.E.message },
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.I.commitId])).toEqual([
      { id: commitTable.I.commitId, message: commitTable.I.message },
      { id: commitTable.G.commitId, message: commitTable.G.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.J.commitId])).toEqual([
      { id: commitTable.J.commitId, message: commitTable.J.message },
      { id: commitTable.I.commitId, message: commitTable.I.message },
      { id: commitTable.H.commitId, message: commitTable.H.message },
      { id: commitTable.G.commitId, message: commitTable.G.message },
      { id: commitTable.F.commitId, message: commitTable.F.message },
      { id: commitTable.E.commitId, message: commitTable.E.message },
      { id: commitTable.D.commitId, message: commitTable.D.message },
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
    expect(await eGetCommitWithMessageList([commitTable.K.commitId])).toEqual([
      { id: commitTable.K.commitId, message: commitTable.K.message },
      { id: commitTable.J.commitId, message: commitTable.J.message },
      { id: commitTable.I.commitId, message: commitTable.I.message },
      { id: commitTable.H.commitId, message: commitTable.H.message },
      { id: commitTable.G.commitId, message: commitTable.G.message },
      { id: commitTable.F.commitId, message: commitTable.F.message },
      { id: commitTable.E.commitId, message: commitTable.E.message },
      { id: commitTable.D.commitId, message: commitTable.D.message },
      { id: commitTable.C.commitId, message: commitTable.C.message },
      { id: commitTable.B.commitId, message: commitTable.B.message },
      { id: commitTable.A.commitId, message: commitTable.A.message },
    ])
  })
})
