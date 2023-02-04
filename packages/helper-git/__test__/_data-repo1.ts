import { mkdirsIfNotExists, rm, writeFile } from '@guanghechen/helper-fs'
import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { assertPromiseThrow } from 'jest.helper'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { IGitCommandBaseParams, IGitCommitInfo } from '../src'
import {
  checkBranch,
  commitAll,
  createBranch,
  deleteBranch,
  initGitRepo,
  listAllFiles,
  mergeCommits,
  showCommitInfo,
} from '../src'

type ISymbol = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'
export interface ICommitItem extends IGitCommandBaseParams, IGitCommitInfo {
  branchName: string
  parentIds: string[]
  amend: boolean
}

export interface IBuildRepo1Params {
  repoDir: string
  logger?: ILogger
  execaOptions?: IExecaOptions
}

export interface IBuildRepo1Result {
  commitIdTable: Record<ISymbol, string>
  commitTable: Record<ISymbol, ICommitItem>
  fpA: string
  fpB: string
  fpC: string
  fpD: string
  fpE: string
  filepathA: string
  filepathB: string
  filepathC: string
  filepathD: string
  filepathE: string
  contentA: string
  contentA2: string
  contentB: string
  contentB2: string
  contentC: string
  contentC2: string
  contentC3: string
  contentD: string
}

// const isVolatileCommitId = !!isCI
const isVolatileCommitId = false

export const getCommitArgTable = (): Record<ISymbol, Omit<IGitCommitInfo, 'commitId'>> => ({
  A: {
    message: 'A -- +a1,+b1 (a1,b1)',
    authorDate: '2023-01-26T07:29:33.000Z',
    authorName: 'guanghechen_a',
    authorEmail: 'exmaple_a@gmail.com',
    committerDate: '2023-01-26T07:29:33.000Z',
    committerName: 'guanghechen_a',
    committerEmail: 'exmaple_a@gmail.com',
  },
  B: {
    message: 'B -- a1->a2,+c1 (a2,b1,c1)',
    authorDate: '2023-01-27T03:50:35.000Z',
    authorName: 'guanghechen_b',
    authorEmail: 'exmaple_b@gmail.com',
    committerDate: '2023-01-27T03:50:35.000Z',
    committerName: 'guanghechen_b',
    committerEmail: 'exmaple_b@gmail.com',
  },
  C: {
    message: 'C -- -a2 (b1,c1)',
    authorDate: '2023-01-27T03:51:32.000Z',
    authorName: 'guanghechen_c',
    authorEmail: 'exmaple_c@gmail.com',
    committerDate: '2023-01-27T03:51:32.000Z',
    committerName: 'guanghechen_c',
    committerEmail: 'exmaple_c@gmail.com',
  },
  D: {
    message: 'D -- +a1,c1->c2 (a1,b1,c2)',
    authorDate: '2023-01-27T03:53:37.000Z',
    authorName: 'guanghechen_d',
    authorEmail: 'exmaple_d@gmail.com',
    committerDate: '2023-01-27T03:53:37.000Z',
    committerName: 'guanghechen_d',
    committerEmail: 'exmaple_d@gmail.com',
  },
  E: {
    message: 'E -- -b1,c1->c2, (c2)',
    authorDate: '2023-01-27T06:58:43.000Z',
    authorName: 'guanghechen_e',
    authorEmail: 'exmaple_e@gmail.com',
    committerDate: '2023-01-27T06:58:43.000Z',
    committerName: 'guanghechen_e',
    committerEmail: 'exmaple_e@gmail.com',
  },
  F: {
    message: 'F -- merge D and E <no conflict> (a1,c2)',
    authorDate: '2023-01-27T06:59:16.000Z',
    authorName: 'guanghechen_f',
    authorEmail: 'exmaple_f@gmail.com',
    committerDate: '2023-01-27T06:59:16.000Z',
    committerName: 'guanghechen_f',
    committerEmail: 'exmaple_f@gmail.com',
  },
  G: {
    message: 'G -- c1->c3,b1->b2 (a2,b2,c3)',
    authorDate: '2023-01-27T06:59:42.000Z',
    authorName: 'guanghechen_g',
    authorEmail: 'exmaple_g@gmail.com',
    committerDate: '2023-01-27T06:59:42.000Z',
    committerName: 'guanghechen_g',
    committerEmail: 'exmaple_g@gmail.com',
  },
  H: {
    message: 'H -- Merge E and G <conflict> (b2,c3)',
    authorDate: '2023-01-27T07:00:08.000Z',
    authorName: 'guanghechen_h',
    authorEmail: 'exmaple_h@gmail.com',
    committerDate: '2023-01-27T07:00:08.000Z',
    committerName: 'guanghechen_h',
    committerEmail: 'exmaple_h@gmail.com',
  },
  I: {
    message: 'I -- b2->b1,+d (a2,b1,c3,d)',
    authorDate: '2023-01-27T07:00:30.000Z',
    authorName: 'guanghechen_i',
    authorEmail: 'exmaple_i@gmail.com',
    committerDate: '2023-01-27T07:00:30.000Z',
    committerName: 'guanghechen_i',
    committerEmail: 'exmaple_i@gmail.com',
  },
  J: {
    message: 'J -- merge F,H,I <conflict> (a2,b2,c3,d)',
    authorDate: '2023-01-27T07:00:45.000Z',
    authorName: 'guanghechen_j',
    authorEmail: 'exmaple_j@gmail.com',
    committerDate: '2023-01-27T07:00:45.000Z',
    committerName: 'guanghechen_i',
    committerEmail: 'exmaple_i@gmail.com',
  },
  K: {
    message:
      'K -- d->e (a2,b2,c3,e)\n\nupdate d,e\ntest multilines message with quotes\'"\n\n  Will it be respected?',
    authorDate: '2023-01-27T07:01:01.000Z',
    authorName: 'guanghechen_k',
    authorEmail: 'exmaple_k@gmail.com',
    committerDate: '2023-01-27T07:01:01.000Z',
    committerName: 'guanghechen_i',
    committerEmail: 'exmaple_i@gmail.com',
  },
})

/**

```
* 993cd74 —— guanghechen_k: K -- d->e (a2,b2,c3,e)  (6 days ago)  (HEAD)
*-.   c4edeed —— guanghechen_j: J -- merge F,H,I <conflict> (a2,b2,c3,d)  (6 days ago)
|\ \
| | *   8710b6a —— guanghechen_f: F -- merge D and E <no conflict> (a1,c2)  (6 days ago)
| | |\
| | | * cbeca71 —— guanghechen_d: D -- +a1,c1->c2 (a1,b1,c2)  (6 days ago)  (main)
| * | | 9f32afa —— guanghechen_h: H -- Merge E and G <conflict> (b2,c3)  (6 days ago)
| |\| |
| | * | 28fc4e7 —— guanghechen_e: E -- -b1,c1->c2, (c2)  (6 days ago)
| | |/
| | * 2a386aa —— guanghechen_c: C -- -a2 (b1,c1)  (6 days ago)
* | | 3a394ce —— guanghechen_i: I -- b2->b1,+d (a2,b1,c3,d)  (6 days ago)
|/ /
* / 06d25f0 —— guanghechen_g: G -- c1->c3,b1->b2 (a2,b2,c3)  (6 days ago)
|/
* 31e4592 —— guanghechen_b: B -- a1->a2,+c1 (a2,b1,c1)  (6 days ago)
* 1042690 —— guanghechen_a: A -- +a1,+b1 (a1,b1)  (7 days ago)
```

 */
export async function buildRepo1({
  repoDir,
  logger,
  execaOptions,
}: IBuildRepo1Params): Promise<IBuildRepo1Result> {
  mkdirsIfNotExists(repoDir, true)

  const fpA = 'a.txt'
  const fpB = 'b.txt'
  const fpC = 'x/c.txt'
  const fpD = 'x/d.txt'
  const fpE = 'y/z/e.txt'

  const filepathA: string = path.join(repoDir, fpA)
  const filepathB: string = path.join(repoDir, fpB)
  const filepathC: string = path.join(repoDir, fpC)
  const filepathD: string = path.join(repoDir, fpD)
  const filepathE: string = path.join(repoDir, fpE)

  const encoding: BufferEncoding = 'utf8'
  const contentA = 'Hello, A.'
  const contentA2 = '你好, A2.'
  const contentB = 'Hello, B.'
  const contentB2 = '你好, B2.'.repeat(150)
  const contentC = 'Hello, C.'.repeat(320)
  const contentC2 = '你好, C2.'.repeat(350)
  const contentC3 = '你好, C3.'.repeat(380)
  const contentD = 'Hello, D.'.repeat(350)

  const ctx: IGitCommandBaseParams = { cwd: repoDir, logger, execaOptions }

  const commitArgTable = getCommitArgTable()
  const commitIdTable = {
    A: 'dc37093aa7ba41efa8e905850c16616f5d8a52a8',
    B: 'b59fc65465578502e74635dceaa48258253e228f',
    C: '40dc1db5ba0488f90b2727116cc909f19c62617d',
    D: '3f4fc9e00633766d0d3ed742cc723b88f99b3ae9',
    E: '9d45e2dc5468c6902c015925a7cecfb8b29504e7',
    F: '2017844536ece2b0670ba93be48b069304a75823',
    G: '270d4c09f0a531bb2a944c00e616cdb76f4cbc00',
    H: '8f6e351cf5978ea7ced2013fe4d6cf87a2c7d518',
    I: 'b331e6a0df7ca6fe53880a8e45649751ad71c1dd',
    J: '593f658d7e2ab642689bde1fdebb42629a92c8ad',
    K: '7ec3265ad8e1ea95a582c373076eac15ec6bfdda',
  }
  const commitTable: Record<ISymbol, ICommitItem> = {
    A: {
      ...ctx,
      branchName: 'A',
      commitId: commitIdTable.A,
      parentIds: [],
      ...commitArgTable.A,
      amend: false,
    },
    B: {
      ...ctx,
      branchName: 'B',
      commitId: commitIdTable.B,
      parentIds: [commitIdTable.A],
      ...commitArgTable.B,
      amend: false,
    },
    C: {
      ...ctx,
      branchName: 'C',
      commitId: commitIdTable.C,
      parentIds: [commitIdTable.B],
      ...commitArgTable.C,
      amend: false,
    },
    D: {
      ...ctx,
      branchName: 'D',
      commitId: commitIdTable.D,
      parentIds: [commitIdTable.C],
      ...commitArgTable.D,
      amend: false,
    },
    E: {
      ...ctx,
      branchName: 'E',
      commitId: commitIdTable.E,
      parentIds: [commitIdTable.C],
      ...commitArgTable.E,
      amend: false,
    },
    F: {
      ...ctx,
      branchName: 'F',
      commitId: commitIdTable.F,
      parentIds: [commitIdTable.E, commitIdTable.D],
      ...commitArgTable.F,
      amend: false,
    },
    G: {
      ...ctx,
      branchName: 'G',
      commitId: commitIdTable.G,
      parentIds: [commitIdTable.B],
      ...commitArgTable.G,
      amend: false,
    },
    H: {
      ...ctx,
      branchName: 'H',
      commitId: commitIdTable.H,
      parentIds: [commitIdTable.G, commitIdTable.E],
      ...commitArgTable.H,
      amend: false,
    },
    I: {
      ...ctx,
      branchName: 'I',
      commitId: commitIdTable.I,
      parentIds: [commitIdTable.G],
      ...commitArgTable.I,
      amend: false,
    },
    J: {
      ...ctx,
      branchName: 'J',
      commitId: commitIdTable.J,
      parentIds: [commitIdTable.I, commitIdTable.H, commitIdTable.F],
      ...commitArgTable.J,
      amend: false,
    },
    K: {
      ...ctx,
      branchName: 'K',
      commitId: commitIdTable.K,
      parentIds: [commitIdTable.J],
      ...commitArgTable.K,
      amend: false,
    },
  }

  const localCommitIdTable = { ...commitIdTable }
  const finalCommitIdTableMap: Map<string, string> = new Map()
  const resetCommitId = async (symbol: ISymbol): Promise<void> => {
    if (isVolatileCommitId) {
      const { commitId } = await showCommitInfo({ ...ctx, branchOrCommitId: 'HEAD' })
      finalCommitIdTableMap.set(localCommitIdTable[symbol], commitId)
      commitIdTable[symbol] = commitId
      commitTable[symbol].commitId = commitId
      commitTable[symbol].parentIds = commitTable[symbol].parentIds.map(
        id => finalCommitIdTableMap.get(id)!,
      )
    }
  }

  const defaultBranch = 'main'
  await initGitRepo({
    ...ctx,
    defaultBranch,
    authorName: 'guanghechen',
    authorEmail: 'example@gmail.com',
    gpgSign: false,
    eol: 'lf',
    encoding: 'utf-8',
  })

  // A: +a1,+b1 (a1,b1)
  const stepA = async (): Promise<void> => {
    const commit = commitTable.A

    await writeFile(filepathA, contentA, encoding)
    await writeFile(filepathB, contentB, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
  }

  // B: a1->a2,+c1 (a2,b1,c1)
  const stepB = async (): Promise<void> => {
    const commit = commitTable.B

    await writeFile(filepathA, contentA2, encoding)
    await writeFile(filepathC, contentC, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB, fpC])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA2)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC)
  }

  // C: -a2 (b1,c1)
  const stepC = async (): Promise<void> => {
    const commit = commitTable.C

    await rm(filepathA)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpB, fpC])
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC)
  }

  // D: +a1,c1->c2 (a1,b1,c2)
  const stepD = async (): Promise<void> => {
    const commit = commitTable.D

    await writeFile(filepathA, contentA, encoding)
    await writeFile(filepathC, contentC2, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB, fpC])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC2)
  }

  // E: -b1,c1->c2 (c2)
  const stepE = async (): Promise<void> => {
    const commit = commitTable.E
    await checkBranch({ ...ctx, branchOrCommitId: commitIdTable.C })

    await rm(filepathB)
    await writeFile(filepathC, contentC2, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpC])
    expect(readFileSync(filepathC, encoding)).toEqual(contentC2)
  }

  // F: merge E,D <no conflict> (a1,c2)
  const stepF = async (): Promise<void> => {
    const commit = commitTable.F

    await mergeCommits({
      ...commit,
      parentIds: [commitIdTable.E, commitIdTable.D],
    })

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpC])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC2)
  }

  // G: c1->c3,b1->b2 (a2,b2,c3)
  const stepG = async (): Promise<void> => {
    const commit = commitTable.G
    await checkBranch({ ...ctx, branchOrCommitId: commitIdTable.B })

    await writeFile(filepathB, contentB2, encoding)
    await writeFile(filepathC, contentC3, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB, fpC])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA2)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB2)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC3)
  }

  // H: merge G,E <conflict> (b2,c3)
  const stepH = async (): Promise<void> => {
    const commit = commitTable.H

    await assertPromiseThrow(
      () =>
        mergeCommits({
          ...commit,
          parentIds: [commitIdTable.G, commitIdTable.E],
        }),
      'Automatic merge failed; fix conflicts and then commit the result.',
    )

    await writeFile(filepathC, contentC3, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpB, fpC])
    expect(readFileSync(filepathB, encoding)).toEqual(contentB2)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC3)
  }

  // I: b2->b1,+d (a2,b1,c3,d)
  const stepI = async (): Promise<void> => {
    const commit = commitTable.I
    await checkBranch({ ...ctx, branchOrCommitId: commitIdTable.G })

    await writeFile(filepathB, contentB, encoding)
    await writeFile(filepathD, contentD, encoding)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB, fpC, fpD])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA2)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC3)
    expect(readFileSync(filepathD, encoding)).toEqual(contentD)
  }

  // J: merge I,H,F <no conflict> (a1,b1,c3,d)
  const stepJ = async (): Promise<void> => {
    const commit = commitTable.J

    await mergeCommits({
      ...commit,
      parentIds: [commitIdTable.I, commitIdTable.H, commitIdTable.F],
    })

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB, fpC, fpD])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC3)
    expect(readFileSync(filepathD, encoding)).toEqual(contentD)
  }

  // K: d->e (a1,b1,c3,e)
  const stepK = async (): Promise<void> => {
    const commit = commitTable.K

    await rm(filepathD)
    await writeFile(filepathE, contentD)
    await commitAll(commit)

    const files: string[] = await listAllFiles({ ...ctx, branchOrCommitId: 'HEAD' })
    expect(files.sort()).toEqual([fpA, fpB, fpC, fpE])
    expect(readFileSync(filepathA, encoding)).toEqual(contentA)
    expect(readFileSync(filepathB, encoding)).toEqual(contentB)
    expect(readFileSync(filepathC, encoding)).toEqual(contentC3)
    expect(readFileSync(filepathE, encoding)).toEqual(contentD)
  }

  await stepA()
  await resetCommitId('A')
  await stepB()
  await resetCommitId('B')
  await stepC()
  await resetCommitId('C')
  await stepD()
  await resetCommitId('D')
  await stepE()
  await resetCommitId('E')
  await stepF()
  await resetCommitId('F')
  await stepG()
  await resetCommitId('G')
  await stepH()
  await resetCommitId('H')
  await stepI()
  await resetCommitId('I')
  await stepJ()
  await resetCommitId('J')
  await stepK()
  await resetCommitId('K')

  await checkBranch({ ...ctx, branchOrCommitId: commitIdTable.K })
  await deleteBranch({ ...ctx, branchName: defaultBranch, force: true })
  await createBranch({ ...ctx, newBranchName: defaultBranch, branchOrCommitId: 'HEAD' })
  await checkBranch({ ...ctx, branchOrCommitId: defaultBranch })

  return {
    commitIdTable,
    commitTable,
    fpA,
    fpB,
    fpC,
    fpD,
    fpE,
    filepathA,
    filepathB,
    filepathC,
    filepathD,
    filepathE,
    contentA,
    contentA2,
    contentB,
    contentB2,
    contentC,
    contentC2,
    contentC3,
    contentD,
  }
}
