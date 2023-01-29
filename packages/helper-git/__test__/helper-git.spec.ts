import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { locateFixtures } from 'jest.helper'
import { existsSync } from 'node:fs'
import path from 'node:path'
import {
  checkBranch,
  cleanUntrackedFilepaths,
  commitAll,
  commitStaged,
  getCommitInTopology,
  hasUncommittedContent,
  initGitRepo,
  listAllFiles,
  listChangedFiles,
  mergeCommits,
  showCommitInfo,
  stageAll,
} from '../src'

describe('atomic', () => {
  const workspaceDir: string = locateFixtures('__fictitious__0')
  runTest({ workspaceDir, defaultBranch: 'main' })
})

describe('atomic -- logger', () => {
  const workspaceDir: string = locateFixtures('__fictitious__1')
  const logger = new ChalkLogger({ name: 'helper-git', level: Level.FATAL })
  runTest({ workspaceDir, logger, execaOptions: { env: { cwd: '/' } } })
})

interface IRunTestParams {
  workspaceDir: string
  logger?: ILogger
  defaultBranch?: string
  execaOptions?: IExecaOptions
}

function runTest(params: IRunTestParams): void {
  const { logger, defaultBranch, workspaceDir, execaOptions } = params
  const fpA = 'a.txt'
  const fpB = 'b.txt'
  const fpC = 'x/c.txt'
  const fpD = 'x/d.txt'
  const fpE = 'y/z/e.txt'
  const filepathA: string = path.join(workspaceDir, fpA)
  const filepathB: string = path.join(workspaceDir, fpB)
  const filepathC: string = path.join(workspaceDir, fpC)
  const filepathD: string = path.join(workspaceDir, fpD)
  const filepathE: string = path.join(workspaceDir, fpE)

  const ctx = { cwd: workspaceDir, logger, execaOptions }
  const commitIdTable = {
    A: '84f1f5f57c0a5b24cb085578d87553f1e5fe48c7',
    B: 'f4b640a9cb5e463eb909e1bd48765233bf12d3fe',
    C: 'bfd8cc6e604d822d0e52a61832c1075c0794d4da',
    D: '19a298394c47a54f7a15fb07f58377f589b4581f',
    E: '5050fc5af5f05488d3dcbd52e88cfdeaadd6504b',
    F: '1bf5a2fb090f6391fc443cd927600fe2244acaac',
    G: '36c32cac7e14587b9ea231c3518a03a840bd00da',
    H: '1787ea51e5c2a984f6d9fe7b36e2510c9a100975',
    I: 'eeafa8079b3acd7778beb136844b8c72091add48',
    J: '91f95134093178854e26d35ab436d1086fde0f55',
    K: '255a5a0dffcfe808a24fc39612509b4d88b6c45f',
  }
  const commitTable = {
    A: {
      ...ctx,
      commitId: commitIdTable.A,
      parentIds: [],
      message: 'A -- add a',
      authorDate: '2023-01-26T07:29:33.000Z',
      authorName: 'guanghechen_a',
      authorEmail: 'exmaple_a@gmail.com',
      committerDate: '2023-01-26T07:29:33.000Z',
      committerName: 'guanghechen_a',
      committerEmail: 'exmaple_a@gmail.com',
      amend: false,
    },
    B: {
      ...ctx,
      commitId: commitIdTable.B,
      parentIds: [commitIdTable.A],
      message: 'B -- add b',
      authorDate: '2023-01-27T03:50:35.000Z',
      authorName: 'guanghechen_b',
      authorEmail: 'exmaple_b@gmail.com',
      committerDate: '2023-01-27T03:50:35.000Z',
      committerName: 'guanghechen_b',
      committerEmail: 'exmaple_b@gmail.com',
      amend: false,
    },
    C: {
      ...ctx,
      commitId: commitIdTable.C,
      parentIds: [commitIdTable.B],
      message: 'C -- update a',
      authorDate: '2023-01-27T03:51:32.000Z',
      authorName: 'guanghechen_c',
      authorEmail: 'exmaple_c@gmail.com',
      committerDate: '2023-01-27T03:50:35.000Z',
      committerName: 'guanghechen_c',
      committerEmail: 'exmaple_c@gmail.com',
      amend: false,
    },
    D: {
      ...ctx,
      commitId: commitIdTable.D,
      parentIds: [commitIdTable.C],
      message: 'D -- update b, add c',
      authorDate: '2023-01-27T03:53:37.000Z',
      authorName: 'guanghechen_d',
      authorEmail: 'exmaple_d@gmail.com',
      committerDate: '2023-01-27T03:53:37.000Z',
      committerName: 'guanghechen_d',
      committerEmail: 'exmaple_d@gmail.com',
      amend: false,
    },
    E: {
      ...ctx,
      commitId: commitIdTable.E,
      parentIds: [commitIdTable.C],
      message: 'E -- update a',
      authorDate: '2023-01-27T06:58:43.000Z',
      authorName: 'guanghechen_e',
      authorEmail: 'exmaple_e@gmail.com',
      committerDate: '2023-01-27T06:58:43.000Z',
      committerName: 'guanghechen_e',
      committerEmail: 'exmaple_e@gmail.com',
      amend: false,
    },
    F: {
      ...ctx,
      commitId: commitIdTable.F,
      parentIds: [commitIdTable.E, commitIdTable.D],
      message: 'F -- merge D and E (fix conflict)',
      authorDate: '2023-01-27T06:59:16.000Z',
      authorName: 'guanghechen_f',
      authorEmail: 'exmaple_f@gmail.com',
      committerDate: '2023-01-27T06:59:16.000Z',
      committerName: 'guanghechen_f',
      committerEmail: 'exmaple_f@gmail.com',
    },
    G: {
      ...ctx,
      commitId: commitIdTable.G,
      parentIds: [commitIdTable.E],
      message: 'G -- add d',
      authorDate: '2023-01-27T06:59:42.000Z',
      authorName: 'guanghechen_g',
      authorEmail: 'exmaple_g@gmail.com',
      committerDate: '2023-01-27T06:59:42.000Z',
      committerName: 'guanghechen_g',
      committerEmail: 'exmaple_g@gmail.com',
      amend: false,
    },
    H: {
      ...ctx,
      commitId: commitIdTable.H,
      parentIds: [commitIdTable.F],
      message: 'H -- update b, delete a',
      authorDate: '2023-01-27T07:00:08.000Z',
      authorName: 'guanghechen_h',
      authorEmail: 'exmaple_h@gmail.com',
      committerDate: '2023-01-27T07:00:08.000Z',
      committerName: 'guanghechen_h',
      committerEmail: 'exmaple_h@gmail.com',
      amend: false,
    },
    I: {
      ...ctx,
      commitId: commitIdTable.I,
      parentIds: [commitIdTable.B],
      message: 'I -- update b, add c,e',
      authorDate: '2023-01-27T07:00:30.000Z',
      authorName: 'guanghechen_i',
      authorEmail: 'exmaple_i@gmail.com',
      committerDate: '2023-01-27T07:00:30.000Z',
      committerName: 'guanghechen_i',
      committerEmail: 'exmaple_i@gmail.com',
      amend: false,
    },
    J: {
      ...ctx,
      commitId: commitIdTable.J,
      parentIds: [commitIdTable.I, commitIdTable.G, commitIdTable.H],
      message: 'J -- merge H,G,I (fix conflict)',
      authorDate: '2023-01-27T07:00:45.000Z',
      authorName: 'guanghechen_i',
      authorEmail: 'exmaple_i@gmail.com',
      committerDate: '2023-01-27T07:00:45.000Z',
      committerName: 'guanghechen_i',
      committerEmail: 'exmaple_i@gmail.com',
      amend: false,
    },
    K: {
      ...ctx,
      commitId: commitIdTable.K,
      parentIds: [commitIdTable.J],
      message: 'K -- update d,e\ntest multilines message with quotes\'"\n\n  Will it be respected?',
      authorDate: '2023-01-27T07:01:01.000Z',
      authorName: 'guanghechen_i',
      authorEmail: 'exmaple_i@gmail.com',
      committerDate: '2023-01-27T07:01:01.000Z',
      committerName: 'guanghechen_i',
      committerEmail: 'exmaple_i@gmail.com',
      amend: false,
    },
  }

  let logMock: IConsoleMock
  beforeEach(async () => {
    logMock = createConsoleMock(['error'])
    await emptyDir(workspaceDir, true)
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
    })

    const p0 = path.join(workspaceDir, '/a/b/c/d.txt')
    const p1 = path.join(workspaceDir, '/a/c/d/e.txt')
    const p2 = path.join(workspaceDir, '/a/b')

    await writeFile(p0, 'hello p1')
    await writeFile(p1, 'hello p1')
    await commitAll(commitTable.A)

    await rm(p0)
    await rm(p1)
    await commitAll(commitTable.B)

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
    await commitAll(commitTable.C)
    expect(existsSync(p2)).toEqual(true)
  })

  test('amend commit', async () => {
    await initGitRepo({
      cwd: workspaceDir,
      defaultBranch: 'main',
      authorName: 'guanghechen',
      authorEmail: 'example@gmail.com',
    })

    await writeFile(filepathA, 'A -- Hello, A.')
    await commitAll(commitTable.A)
    expect(await getCommitInTopology({ ...ctx, commitId: 'HEAD' })).toEqual([
      { id: commitIdTable.A, parents: [] },
    ])

    await writeFile(filepathB, 'B -- Hello, B.')
    await commitAll(commitTable.B)
    expect(await getCommitInTopology({ ...ctx, commitId: 'HEAD' })).toEqual([
      { id: commitIdTable.A, parents: [] },
      { id: commitIdTable.B, parents: [commitIdTable.A] },
    ])

    await writeFile(filepathB, 'B -- Hello, B, amend contents.')
    await commitAll({ ...commitTable.B, amend: true })

    expect(await getCommitInTopology({ ...ctx, commitId: 'HEAD' })).toEqual([
      { id: commitIdTable.A, parents: [] },
      {
        id: 'cfc43672f861a7e7ff280ef0b3ec3f28a57b13ad',
        parents: ['84f1f5f57c0a5b24cb085578d87553f1e5fe48c7'],
      },
    ])

    await writeFile(filepathB, 'B -- Hello, B.')
    await commitAll({ ...commitTable.B, amend: true })
    expect(await getCommitInTopology({ ...ctx, commitId: 'HEAD' })).toEqual([
      { id: commitIdTable.A, parents: [] },
      { id: commitIdTable.B, parents: [commitIdTable.A] },
    ])
  })

  test('comprehensive', async () => {
    await initGitRepo({
      cwd: workspaceDir,
      defaultBranch,
      authorName: 'guanghechen',
      authorEmail: 'example@gmail.com',
      logger,
    })

    expect(await hasUncommittedContent(ctx)).toEqual(false)
    await expect(() => commitAll(commitTable.D)).rejects.toThrow(
      /Initial commit\s+nothing to commit/,
    )

    await writeFile(filepathA, 'A -- Hello, A.')
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await commitAll(commitTable.A)
    expect(await hasUncommittedContent(ctx)).toEqual(false)

    await writeFile(filepathB, 'B -- Hello, B.')
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await stageAll(ctx)
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await writeFile(filepathA, 'C -- Hello, A.')
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await commitStaged(commitTable.B)
    expect(await hasUncommittedContent(ctx)).toEqual(true)

    await commitAll(commitTable.C)
    expect(await hasUncommittedContent(ctx)).toEqual(false)

    await expect(() => commitAll(commitTable.D)).rejects.toThrow(
      'nothing to commit, working tree clean',
    )

    await writeFile(filepathB, 'D -- Hello, B.')
    await writeFile(filepathC, 'D -- Hello, C.')
    await commitAll(commitTable.D)

    await checkBranch({ ...ctx, commitId: commitIdTable.C })
    await writeFile(filepathA, 'E -- Hello, A.')
    await commitAll(commitTable.E)

    await checkBranch({ ...ctx, commitId: commitIdTable.E })
    await mergeCommits({ ...commitTable.F, parentIds: [commitIdTable.E, commitIdTable.D] })

    await checkBranch({ ...ctx, commitId: commitIdTable.E })
    await writeFile(filepathD, 'G -- Hello, D.')
    await commitAll(commitTable.G)

    await checkBranch({ ...ctx, commitId: commitIdTable.F })
    await writeFile(filepathB, 'H -- Hello, B.')
    await rm(filepathA)
    await commitAll(commitTable.H)

    await checkBranch({ ...ctx, commitId: commitIdTable.B })
    await writeFile(filepathB, 'I -- Hello, B.')
    await writeFile(filepathC, 'I -- Hello, C.')
    await commitAll(commitTable.I)

    await checkBranch({ ...ctx, commitId: commitIdTable.I })
    await expect(() =>
      mergeCommits({
        ...commitTable.J,
        parentIds: [commitIdTable.I, commitIdTable.G, commitIdTable.H],
      }),
    ).rejects.toThrow('Automatic merge failed; fix conflicts and then commit the result.')
    await writeFile(filepathB, 'J -- Hello, B.')
    await writeFile(filepathC, 'J -- Hello, C.')
    await writeFile(filepathE, 'J -- Hello, E.')
    await commitAll(commitTable.J)

    await writeFile(filepathD, 'K -- Hello, D.')
    await writeFile(filepathE, 'K -- Hello, E.')
    await commitAll(commitTable.K)

    // test getCommitInTopology
    expect(await getCommitInTopology({ ...ctx, commitId: 'HEAD' })).toEqual([
      { id: commitIdTable.A, parents: [] },
      { id: commitIdTable.B, parents: [commitIdTable.A] },
      { id: commitIdTable.C, parents: [commitIdTable.B] },
      { id: commitIdTable.D, parents: [commitIdTable.C] },
      { id: commitIdTable.E, parents: [commitIdTable.C] },
      { id: commitIdTable.F, parents: [commitIdTable.E, commitIdTable.D] },
      { id: commitIdTable.G, parents: [commitIdTable.E] },
      { id: commitIdTable.H, parents: [commitIdTable.F] },
      { id: commitIdTable.I, parents: [commitIdTable.B] },
      { id: commitIdTable.J, parents: [commitIdTable.I, commitIdTable.G, commitIdTable.H] },
      { id: commitIdTable.K, parents: [commitIdTable.J] },
    ])
    // test listAllFiles
    expect(await listAllFiles(commitTable.A)).toEqual([fpA])
    expect(await listAllFiles(commitTable.B)).toEqual([fpA, fpB])
    expect(await listAllFiles(commitTable.C)).toEqual([fpA, fpB])
    expect(await listAllFiles(commitTable.D)).toEqual([fpA, fpB, fpC])
    expect(await listAllFiles(commitTable.E)).toEqual([fpA, fpB])
    expect(await listAllFiles(commitTable.F)).toEqual([fpA, fpB, fpC])
    expect(await listAllFiles(commitTable.G)).toEqual([fpA, fpB, fpD])
    expect(await listAllFiles(commitTable.H)).toEqual([fpB, fpC])
    expect(await listAllFiles(commitTable.I)).toEqual([fpA, fpB, fpC])
    expect(await listAllFiles(commitTable.J)).toEqual([fpB, fpC, fpD, fpE])
    expect(await listAllFiles(commitTable.K)).toEqual([fpB, fpC, fpD, fpE])

    // listChangedFiles
    expect((await listChangedFiles(commitTable.A)).sort()).toEqual([fpA])
    expect((await listChangedFiles(commitTable.B)).sort()).toEqual([fpB])
    expect((await listChangedFiles(commitTable.C)).sort()).toEqual([fpA])
    expect((await listChangedFiles(commitTable.D)).sort()).toEqual([fpB, fpC])
    expect((await listChangedFiles(commitTable.E)).sort()).toEqual([fpA])
    expect((await listChangedFiles(commitTable.F)).sort()).toEqual([fpA, fpB, fpC])
    expect((await listChangedFiles(commitTable.G)).sort()).toEqual([fpD])
    expect((await listChangedFiles(commitTable.H)).sort()).toEqual([fpA, fpB])
    expect((await listChangedFiles(commitTable.I)).sort()).toEqual([fpB, fpC])
    expect((await listChangedFiles(commitTable.J)).sort()).toEqual([fpA, fpB, fpC, fpD])
    expect((await listChangedFiles(commitTable.K)).sort()).toEqual([fpD, fpE])

    // showCommitInfo
    for (const symbol of Object.keys(commitTable)) {
      const commit = commitTable[symbol]
      expect({ ...(await showCommitInfo(commit)), symbol }).toEqual({
        symbol,
        authorDate: commit.authorDate,
        authorName: commit.authorName,
        authorEmail: commit.authorEmail,
        committerDate: commit.committerDate,
        committerName: commit.committerName,
        committerEmail: commit.committerEmail,
        message: commit.message,
      })
    }

    expect(logMock.getIndiscriminateAll()).toEqual([
      ['[safeExeca] failed to run:', 'git', "commit -m 'D -- update b, add c'"],
      ['[safeExeca] failed to run:', 'git', "commit -m 'D -- update b, add c'"],
      [
        '[safeExeca] failed to run:',
        'git',
        `merge ${commitIdTable.I} ${commitIdTable.G} ${commitIdTable.H} -m 'J -- merge H,G,I (fix conflict)'`,
      ],
    ])
  })
}
