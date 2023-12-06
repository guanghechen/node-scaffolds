// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { emptyDir, locateFixtures, rm, writeFile } from 'jest.helper'
import path from 'node:path'
import { commitAll } from '../src/command/commit'
import { initGitRepo } from '../src/command/init'
import { showCommitInfo } from '../src/command/view'
import type { IGitCommandBaseParams } from '../src/types'

describe('waw', () => {
  const workspaceDir: string = locateFixtures('__fictitious__waw')
  const reporter = new Reporter(chalk, {
    baseName: 'waw',
    level: ReporterLevelEnum.ERROR,
    flights: { inline: true },
  })
  const ctx: IGitCommandBaseParams = { cwd: workspaceDir, reporter, execaOptions: {} }

  const encoding: BufferEncoding = 'utf8'
  const filepathA: string = path.join(workspaceDir, 'a.txt')
  const contentA = 'Hello, world!'

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })
  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('fixed commit id', async () => {
    await initGitRepo({
      ...ctx,
      defaultBranch: 'main',
      authorName: 'guanghechen',
      authorEmail: 'example@gmail.com',
      gpgSign: false,
      eol: 'lf',
      encoding: 'utf-8',
    })

    await writeFile(filepathA, contentA, encoding)
    await commitAll({
      ...ctx,
      authorDate: '2023-01-26 15:29:33 +0800',
      authorName: 'guanghechen_a',
      authorEmail: 'exmaple_a@gmail.com',
      committerDate: '2023-01-26 15:29:33 +0800',
      committerName: 'guanghechen_a',
      committerEmail: 'exmaple_a@gmail.com',
      message: 'initialize',
      amend: false,
    })

    const info = await showCommitInfo({ ...ctx, commitHash: 'HEAD' })
    expect(info).toEqual({
      commitId: '6abc2dbd3b8769c72583141c8879294f190c56c1',
      authorDate: '2023-01-26 15:29:33 +0800',
      authorEmail: 'exmaple_a@gmail.com',
      authorName: 'guanghechen_a',
      committerDate: '2023-01-26 15:29:33 +0800',
      committerEmail: 'exmaple_a@gmail.com',
      committerName: 'guanghechen_a',
      message: 'initialize',
    })
  })
})
