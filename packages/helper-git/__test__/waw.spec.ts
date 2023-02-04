import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import { commitAll } from '../src/command/commit'
import { initGitRepo } from '../src/command/init'
import { showCommitInfo } from '../src/command/view'
import type { IGitCommandBaseParams } from '../src/types'

describe('waw', () => {
  const workspaceDir: string = locateFixtures('__fictitious__waw')
  const logger = new ChalkLogger({
    name: 'waw',
    level: Level.ERROR,
    flags: { inline: true },
  })
  const ctx: IGitCommandBaseParams = { cwd: workspaceDir, logger, execaOptions: {} }

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
      authorDate: '2023-01-26T07:29:33.000Z',
      authorName: 'guanghechen_a',
      authorEmail: 'exmaple_a@gmail.com',
      committerDate: '2023-01-26T07:29:33.000Z',
      committerName: 'guanghechen_a',
      committerEmail: 'exmaple_a@gmail.com',
      message: 'initialize',
      amend: false,
    })

    const info = await showCommitInfo({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(info).toEqual({
      commitId: 'd8fed2368acbdd041397ce2b331465a6df14d344',
      authorDate: '2023-01-26T07:29:33.000Z',
      authorEmail: 'exmaple_a@gmail.com',
      authorName: 'guanghechen_a',
      committerDate: '2023-01-26T07:29:33.000Z',
      committerEmail: 'exmaple_a@gmail.com',
      committerName: 'guanghechen_a',
      message: 'initialize',
    })
  })
})
