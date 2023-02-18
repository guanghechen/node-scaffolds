import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import type { ILoggerMock } from '@guanghechen/helper-jest'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { assertPromiseThrow, emptyDir, locateFixtures, rm } from 'jest.helper'
import type { IGitCommandBaseParams } from '../src'
import { checkBranch, createBranch, deleteBranch, getAllLocalBranches } from '../src'
import type { ICommitItem } from './_data-repo1'
import { buildRepo1 } from './_data-repo1'
import { assertAtCommit } from './_util'

describe('branch', () => {
  const workspaceDir: string = locateFixtures('__fictitious__branch')
  const logger = new ChalkLogger({
    name: 'branch',
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

  test('createBranch / deleteBranch / checkBranch', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      logger,
      execaOptions: {},
    })

    const assertCreateBranch = async (commit: ICommitItem, branchName: string): Promise<void> => {
      await assertPromiseThrow(
        () => checkBranch({ ...ctx, branchOrCommitId: branchName }),
        `'${branchName}' did not match any file(s) known to git`,
      )
      await createBranch({ ...ctx, newBranchName: branchName, branchOrCommitId: commit.commitId })
      await checkBranch({ ...ctx, branchOrCommitId: branchName })
      await assertAtCommit(ctx, commit)
    }

    expect(await getAllLocalBranches(ctx)).toEqual({ currentBranch: 'main', branches: ['main'] })

    await assertCreateBranch(commitTable.A, 'A')
    expect(await getAllLocalBranches(ctx)).toEqual({ currentBranch: 'A', branches: ['A', 'main'] })

    await assertCreateBranch(commitTable.B, 'B')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'B',
      branches: ['A', 'B', 'main'],
    })

    await assertCreateBranch(commitTable.C, 'C')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'C',
      branches: ['A', 'B', 'C', 'main'],
    })

    await assertCreateBranch(commitTable.D, 'D')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'D',
      branches: ['A', 'B', 'C', 'D', 'main'],
    })

    await assertCreateBranch(commitTable.E, 'E')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'E',
      branches: ['A', 'B', 'C', 'D', 'E', 'main'],
    })

    await assertCreateBranch(commitTable.F, 'F')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'F',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'main'],
    })

    await assertCreateBranch(commitTable.G, 'G')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'G',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'main'],
    })

    await assertCreateBranch(commitTable.H, 'H')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'H',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'main'],
    })

    await assertCreateBranch(commitTable.I, 'I')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'I',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'main'],
    })

    await assertCreateBranch(commitTable.J, 'J')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'J',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'main'],
    })

    await assertCreateBranch(commitTable.K, 'K')
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'K',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await checkBranch({ ...ctx, branchOrCommitId: commitTable.A.commitId })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: null,
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    // Delete branches.
    await checkBranch({ ...ctx, branchOrCommitId: 'E' })
    await assertPromiseThrow(
      () => deleteBranch({ ...ctx, branchName: 'D', force: false }),
      `The branch 'D' is not fully merged`,
    )

    await checkBranch({ ...ctx, branchOrCommitId: 'main' })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'A', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'B', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'C', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'D', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'E', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['F', 'G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'F', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['G', 'H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'G', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['H', 'I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'H', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['I', 'J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'I', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['J', 'K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'J', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['K', 'main'],
    })

    await deleteBranch({ ...ctx, branchName: 'K', force: true })
    expect(await getAllLocalBranches(ctx)).toEqual({
      currentBranch: 'main',
      branches: ['main'],
    })

    await assertPromiseThrow(
      () => deleteBranch({ ...ctx, branchName: 'K', force: true }),
      `branch 'K' not found`,
    )
    expect(await getAllLocalBranches(ctx)).toEqual({ currentBranch: 'main', branches: ['main'] })

    await assertPromiseThrow(
      () => deleteBranch({ ...ctx, branchName: 'main', force: true }),
      `Cannot delete branch 'main'`,
    )
    expect(await getAllLocalBranches(ctx)).toEqual({ currentBranch: 'main', branches: ['main'] })
  })
})
