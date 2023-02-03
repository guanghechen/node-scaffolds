import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import type { IGitCommandBaseParams } from '../src'
import { commitAll, commitStaged, hasUncommittedContent, initGitRepo, stageAll } from '../src'
import { getCommitArgTable } from './_data-repo1'

describe('check', () => {
  const workspaceDir: string = locateFixtures('__fictitious__check')
  const logger = new ChalkLogger({
    name: 'check',
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

  test('hasUncommittedContent', async () => {
    await initGitRepo({
      cwd: workspaceDir,
      defaultBranch: 'main',
      authorName: 'guanghechen',
      authorEmail: 'example@gmail.com',
      logger,
    })

    const commitArgTable = getCommitArgTable()
    const filepathA: string = path.join(workspaceDir, 'a.txt')
    const filepathB: string = path.join(workspaceDir, 'b.txt')

    expect(await hasUncommittedContent(ctx)).toEqual(false)
    await expect(() => commitAll({ ...ctx, ...commitArgTable.D, amend: false })).rejects.toThrow(
      /Initial commit\s+nothing to commit/,
    )

    await writeFile(filepathA, 'A -- Hello, A.')
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await commitAll({ ...ctx, ...commitArgTable.A, amend: false })
    expect(await hasUncommittedContent(ctx)).toEqual(false)

    await writeFile(filepathB, 'B -- Hello, B.')
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await stageAll(ctx)
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await writeFile(filepathA, 'C -- Hello, A.')
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await commitStaged({ ...ctx, ...commitArgTable.B, amend: false })
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await commitAll({ ...ctx, ...commitArgTable.C, amend: false })
    expect(await hasUncommittedContent(ctx)).toEqual(false)

    await expect(() => commitAll({ ...ctx, ...commitArgTable.D, amend: false })).rejects.toThrow(
      'nothing to commit, working tree clean',
    )
  })
})
