// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type { IReporterMock } from '@guanghechen/helper-jest'
import { createReporterMock } from '@guanghechen/helper-jest'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { emptyDir, locateFixtures, rm, writeFile } from 'jest.helper'
import path from 'node:path'
import type { IGitCommandBaseParams } from '../src'
import { commitAll, commitStaged, hasUncommittedContent, initGitRepo, stageAll } from '../src'
import { getCommitArgTable } from './_data-repo1'

describe('check', () => {
  const workspaceDir: string = locateFixtures('__fictitious__check')
  const reporter = new Reporter(chalk, {
    baseName: 'check',
    level: ReporterLevelEnum.ERROR,
    flights: { inline: true, colorful: false },
  })
  const ctx: IGitCommandBaseParams = { cwd: workspaceDir, reporter, execaOptions: {} }

  let logMock: IReporterMock
  beforeEach(async () => {
    logMock = createReporterMock({ reporter })
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
      gpgSign: false,
      reporter,
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
