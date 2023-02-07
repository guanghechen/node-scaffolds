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
} from '../src'

type IRepo1Symbol = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'
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
  commitIdTable: Record<IRepo1Symbol, string>
  commitTable: Record<IRepo1Symbol, ICommitItem>
  filepathA: string
  filepathB: string
  filepathC: string
  filepathD: string
  filepathE: string
}

export const encoding: BufferEncoding = 'utf8'

export const fpA = 'a.txt'
export const fpB = 'b.txt'
export const fpC = 'x/c.txt'
export const fpD = 'x/d.txt'
export const fpE = 'y/z/e.txt'

export const contentA = 'Hello, A.'
export const contentA2 = '你好, A2.'
export const contentB = 'Hello, B.'
export const contentB2 = '你好, B2.'.repeat(150)
export const contentC = 'Hello, C.'.repeat(320)
export const contentC2 = '你好, C2.'.repeat(350)
export const contentC3 = '你好, C3.'.repeat(380)
export const contentD = 'Hello, D.'.repeat(350)

export const getCommitArgTable = (): Record<IRepo1Symbol, Omit<IGitCommitInfo, 'commitId'>> => ({
  A: {
    message: 'A -- +a1,+b1 (a1,b1)',
    authorDate: '2023-01-26 15:29:33 +0800',
    authorName: 'guanghechen_a',
    authorEmail: 'exmaple_a@gmail.com',
    committerDate: '2023-01-26 15:29:33 +0800',
    committerName: 'guanghechen_a',
    committerEmail: 'exmaple_a@gmail.com',
  },
  B: {
    message: 'B -- a1->a2,+c1 (a2,b1,c1)',
    authorDate: '2023-01-27 11:50:35 +0800',
    authorName: 'guanghechen_b',
    authorEmail: 'exmaple_b@gmail.com',
    committerDate: '2023-01-27 11:50:35 +0800',
    committerName: 'guanghechen_b',
    committerEmail: 'exmaple_b@gmail.com',
  },
  C: {
    message: 'C -- -a2 (b1,c1)',
    authorDate: '2023-01-27 11:51:32 +0800',
    authorName: 'guanghechen_c',
    authorEmail: 'exmaple_c@gmail.com',
    committerDate: '2023-01-27 11:51:32 +0800',
    committerName: 'guanghechen_c',
    committerEmail: 'exmaple_c@gmail.com',
  },
  D: {
    message: 'D -- +a1,c1->c2 (a1,b1,c2)',
    authorDate: '2023-01-27 11:53:37 +0800',
    authorName: 'guanghechen_d',
    authorEmail: 'exmaple_d@gmail.com',
    committerDate: '2023-01-27 11:53:37 +0800',
    committerName: 'guanghechen_d',
    committerEmail: 'exmaple_d@gmail.com',
  },
  E: {
    message: 'E -- -b1,c1->c2, (c2)',
    authorDate: '2023-01-27 14:58:43 +0800',
    authorName: 'guanghechen_e',
    authorEmail: 'exmaple_e@gmail.com',
    committerDate: '2023-01-27 14:58:43 +0800',
    committerName: 'guanghechen_e',
    committerEmail: 'exmaple_e@gmail.com',
  },
  F: {
    message: 'F -- merge D and E <no conflict> (a1,c2)',
    authorDate: '2023-01-27 14:59:16 +0800',
    authorName: 'guanghechen_f',
    authorEmail: 'exmaple_f@gmail.com',
    committerDate: '2023-01-27 14:59:16 +0800',
    committerName: 'guanghechen_f',
    committerEmail: 'exmaple_f@gmail.com',
  },
  G: {
    message: 'G -- c1->c3,b1->b2 (a2,b2,c3)',
    authorDate: '2023-01-27 14:59:42 +0800',
    authorName: 'guanghechen_g',
    authorEmail: 'exmaple_g@gmail.com',
    committerDate: '2023-01-27 14:59:42 +0800',
    committerName: 'guanghechen_g',
    committerEmail: 'exmaple_g@gmail.com',
  },
  H: {
    message: 'H -- Merge E and G <conflict> (b2,c3)',
    authorDate: '2023-01-27 15:00:08 +0800',
    authorName: 'guanghechen_h',
    authorEmail: 'exmaple_h@gmail.com',
    committerDate: '2023-01-27 15:00:08 +0800',
    committerName: 'guanghechen_h',
    committerEmail: 'exmaple_h@gmail.com',
  },
  I: {
    message: 'I -- b2->b1,+d (a2,b1,c3,d)',
    authorDate: '2023-01-27 15:00:30 +0800',
    authorName: 'guanghechen_i',
    authorEmail: 'exmaple_i@gmail.com',
    committerDate: '2023-01-27 15:00:30 +0800',
    committerName: 'guanghechen_i',
    committerEmail: 'exmaple_i@gmail.com',
  },
  J: {
    message: 'J -- merge F,H,I <conflict> (a1,b1,c3,d)',
    authorDate: '2023-01-27 15:00:45 +0800',
    authorName: 'guanghechen_j',
    authorEmail: 'exmaple_j@gmail.com',
    committerDate: '2023-01-27 15:00:45 +0800',
    committerName: 'guanghechen_i',
    committerEmail: 'exmaple_i@gmail.com',
  },
  K: {
    message:
      'K -- d->e (a1,b1,c3,e)\n\nupdate d,e\ntest multilines message with quotes\'"\n\n  Will it be respected?',
    authorDate: '2023-01-27 15:01:01 +0800',
    authorName: 'guanghechen_k',
    authorEmail: 'exmaple_k@gmail.com',
    committerDate: '2023-01-27 15:01:01 +0800',
    committerName: 'guanghechen_i',
    committerEmail: 'exmaple_i@gmail.com',
  },
})

/**

```
* 0e67eda —— guanghechen_k: K -- d->e (a1,b1,c3,e)  (6 days ago)  (HEAD)
*-.   7e40106 —— guanghechen_j: J -- merge F,H,I <conflict> (a1,b1,c3,d)  (6 days ago)
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

  const filepathA: string = path.join(repoDir, fpA)
  const filepathB: string = path.join(repoDir, fpB)
  const filepathC: string = path.join(repoDir, fpC)
  const filepathD: string = path.join(repoDir, fpD)
  const filepathE: string = path.join(repoDir, fpE)
  const ctx: IGitCommandBaseParams = { cwd: repoDir, logger, execaOptions }

  const commitArgTable = getCommitArgTable()
  const commitIdTable = {
    A: '104269042e92f735f1a006a11ca60f91435e1530',
    B: '31e45924180c2280f47e95a6891fc4f1545b1af9',
    C: '2a386aa42b60cd4fffa15341bb1418f9acabb79f',
    D: 'cbeca71f8d00551f6565a450de582f4005ee4725',
    E: '28fc4e74bf3bc436c21774dfc9947d60116d9716',
    F: '8710b6a7a5174b6024a63f66a47f76f0a01bf465',
    G: '06d25f06c6cd40756bf61624f1ee37bf014ec6d0',
    H: '9f32afa6b6b4f1a57aab90da497e2982348b385c',
    I: '3a394ce736aad9c33532e07262e685e4a1a709b0',
    J: '7e401060bb7bf51d21061f356e6123d271f31b03',
    K: '0e67eda7e6a6f7d01dd1ad5705d8b79d25bb3916',
  }
  const commitTable: Record<IRepo1Symbol, ICommitItem> = {
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
  await stepB()
  await stepC()
  await stepD()
  await stepE()
  await stepF()
  await stepG()
  await stepH()
  await stepI()
  await stepJ()
  await stepK()

  await checkBranch({ ...ctx, branchOrCommitId: commitIdTable.K })
  await deleteBranch({ ...ctx, branchName: defaultBranch, force: true })
  await createBranch({ ...ctx, newBranchName: defaultBranch, branchOrCommitId: 'HEAD' })
  await checkBranch({ ...ctx, branchOrCommitId: defaultBranch })

  return {
    commitIdTable,
    commitTable,
    filepathA,
    filepathB,
    filepathC,
    filepathD,
    filepathE,
  }
}
