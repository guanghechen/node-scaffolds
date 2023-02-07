import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import type { ILoggerMock } from '@guanghechen/helper-jest'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { locateFixtures } from 'jest.helper'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { IGitCommandBaseParams } from '../src'
import { cleanUntrackedFilepaths, commitAll, initGitRepo } from '../src'

describe('clean', () => {
  const workspaceDir: string = locateFixtures('__fictitious__clean')
  const logger = new ChalkLogger({
    name: 'clean',
    level: Level.ERROR,
    flags: { inline: true, colorful: false },
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

  test('cleanUntrackedFilepaths', async () => {
    await initGitRepo({
      cwd: workspaceDir,
      defaultBranch: 'main',
      authorName: 'guanghechen',
      authorEmail: 'example@gmail.com',
      logger,
    })

    const p0 = path.join(workspaceDir, '/a/b/c/d.txt')
    const p1 = path.join(workspaceDir, '/a/c/d/e.txt')
    const p2 = path.join(workspaceDir, '/a/b')

    await writeFile(p0, 'hello p1')
    await writeFile(p1, 'hello p1')
    await commitAll({
      ...ctx,
      message: 'A -- +a1,+b1 (a1,b1)',
      authorDate: '2023-01-26T07:29:33.000Z',
      authorName: 'guanghechen_a',
      authorEmail: 'exmaple_a@gmail.com',
      committerDate: '2023-01-26T07:29:33.000Z',
      committerName: 'guanghechen_a',
      committerEmail: 'exmaple_a@gmail.com',
      amend: false,
    })

    await rm(p0)
    await rm(p1)
    await commitAll({
      ...ctx,
      message: 'B -- a1->a2,+c1 (a2,b1,c1)',
      authorDate: '2023-01-27T03:50:35.000Z',
      authorName: 'guanghechen_b',
      authorEmail: 'exmaple_b@gmail.com',
      committerDate: '2023-01-27T03:50:35.000Z',
      committerName: 'guanghechen_b',
      committerEmail: 'exmaple_b@gmail.com',
      amend: false,
    })

    expect(existsSync(p0)).toEqual(false)
    expect(existsSync(p1)).toEqual(false)
    expect(existsSync(path.dirname(p0))).toEqual(true)
    expect(existsSync(path.dirname(p1))).toEqual(true)
    expect(existsSync(p2)).toEqual(true)

    await cleanUntrackedFilepaths({ ...ctx, filepaths: [p2] })
    expect(existsSync(path.dirname(p0))).toEqual(false)
    expect(existsSync(path.dirname(p1))).toEqual(true)
    expect(existsSync(p2)).toEqual(false)

    await writeFile(p2, 'hello p2')
    await commitAll({
      ...ctx,
      message: 'C -- -a2 (b1,c1)',
      authorDate: '2023-01-27T03:51:32.000Z',
      authorName: 'guanghechen_c',
      authorEmail: 'exmaple_c@gmail.com',
      committerDate: '2023-01-27T03:51:32.000Z',
      committerName: 'guanghechen_c',
      committerEmail: 'exmaple_c@gmail.com',
      amend: false,
    })
    expect(existsSync(p2)).toEqual(true)
  })
})
