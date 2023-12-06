// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type { IReporterMock } from '@guanghechen/helper-jest'
import { createReporterMock } from '@guanghechen/helper-jest'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { emptyDir, locateFixtures, rm } from 'jest.helper'
import type { IGitCommandBaseParams } from '../src'
import {
  checkBranch,
  getHeadBranchOrCommitId,
  listAllFiles,
  listDiffFiles,
  showCommitInfo,
  showFileContent,
} from '../src'
import type { ICommitItem } from './_data-repo1'
import {
  buildRepo1,
  contentA,
  contentA2,
  contentB,
  contentB2,
  contentC,
  contentC2,
  contentC3,
  contentD,
  fpA,
  fpB,
  fpC,
  fpD,
  fpE,
} from './_data-repo1'

describe('view', () => {
  const workspaceDir: string = locateFixtures('__fictitious__view')
  const reporter = new Reporter(chalk, {
    baseName: 'view',
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

  test('listAllFiles', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      reporter,
      execaOptions: {},
    })

    const eListAllFiles = (commit: ICommitItem): Promise<string[]> =>
      listAllFiles({ ...ctx, commitHash: commit.commitId })

    expect(await eListAllFiles(commitTable.A)).toEqual([fpA, fpB])
    expect(await eListAllFiles(commitTable.B)).toEqual([fpA, fpB, fpC])
    expect(await eListAllFiles(commitTable.C)).toEqual([fpB, fpC])
    expect(await eListAllFiles(commitTable.D)).toEqual([fpA, fpB, fpC])
    expect(await eListAllFiles(commitTable.E)).toEqual([fpC])
    expect(await eListAllFiles(commitTable.F)).toEqual([fpA, fpC])
    expect(await eListAllFiles(commitTable.G)).toEqual([fpA, fpB, fpC])
    expect(await eListAllFiles(commitTable.H)).toEqual([fpB, fpC])
    expect(await eListAllFiles(commitTable.I)).toEqual([fpA, fpB, fpC, fpD])
    expect(await eListAllFiles(commitTable.J)).toEqual([fpA, fpB, fpC, fpD])
    expect(await eListAllFiles(commitTable.K)).toEqual([fpA, fpB, fpC, fpE])
  })

  test('listDiffFiles', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      reporter,
      execaOptions: {},
    })

    const eListDiffFiles = (commit: ICommitItem): Promise<string[]> =>
      commit.parentIds.length > 0
        ? listDiffFiles({
            ...ctx,
            newerCommitHash: commit.commitId,
            olderCommitHash: commit.parentIds[0],
          }).then(md => md.sort())
        : listAllFiles({ ...ctx, commitHash: commit.commitId }).then(md => md.sort())

    expect(await eListDiffFiles(commitTable.A)).toEqual([fpA, fpB])
    expect(await eListDiffFiles(commitTable.B)).toEqual([fpA, fpC])
    expect(await eListDiffFiles(commitTable.C)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.D)).toEqual([fpA, fpC])
    expect(await eListDiffFiles(commitTable.E)).toEqual([fpB, fpC])
    expect(await eListDiffFiles(commitTable.F)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.G)).toEqual([fpB, fpC])
    expect(await eListDiffFiles(commitTable.H)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.I)).toEqual([fpB, fpD])
    expect(await eListDiffFiles(commitTable.J)).toEqual([fpA])
    expect(await eListDiffFiles(commitTable.K)).toEqual([fpD, fpE])
  })

  test('showCommitInfo', async () => {
    const { commitTable } = await buildRepo1({
      repoDir: workspaceDir,
      reporter,
      execaOptions: {},
    })

    const assertShowCommitInfo = async (commit: ICommitItem): Promise<void> => {
      const info = await showCommitInfo({ ...ctx, commitHash: commit.commitId })
      expect(info).toEqual({
        commitId: commit.commitId,
        authorDate: commit.authorDate,
        authorName: commit.authorName,
        authorEmail: commit.authorEmail,
        committerDate: commit.committerDate,
        committerName: commit.committerName,
        committerEmail: commit.committerEmail,
        message: commit.message,
      })
    }

    await assertShowCommitInfo(commitTable.A)
    await assertShowCommitInfo(commitTable.B)
    await assertShowCommitInfo(commitTable.C)
    await assertShowCommitInfo(commitTable.D)
    await assertShowCommitInfo(commitTable.E)
    await assertShowCommitInfo(commitTable.F)
    await assertShowCommitInfo(commitTable.G)
    await assertShowCommitInfo(commitTable.H)
    await assertShowCommitInfo(commitTable.I)
    await assertShowCommitInfo(commitTable.J)
    await assertShowCommitInfo(commitTable.K)
  })

  test('getCurrentBranchOrHeadCommitId', async () => {
    const { commitIdTable } = await buildRepo1({
      repoDir: workspaceDir,
      reporter,
      execaOptions: {},
    })

    const eGetHeadId = (): Promise<string> => getHeadBranchOrCommitId(ctx)

    expect(await eGetHeadId()).toEqual('main')

    await checkBranch({ ...ctx, commitHash: commitIdTable.A })
    expect(await eGetHeadId()).toEqual(commitIdTable.A)

    await checkBranch({ ...ctx, commitHash: commitIdTable.B })
    expect(await eGetHeadId()).toEqual(commitIdTable.B)

    await checkBranch({ ...ctx, commitHash: commitIdTable.C })
    expect(await eGetHeadId()).toEqual(commitIdTable.C)

    await checkBranch({ ...ctx, commitHash: commitIdTable.D })
    expect(await eGetHeadId()).toEqual(commitIdTable.D)

    await checkBranch({ ...ctx, commitHash: commitIdTable.E })
    expect(await eGetHeadId()).toEqual(commitIdTable.E)

    await checkBranch({ ...ctx, commitHash: commitIdTable.F })
    expect(await eGetHeadId()).toEqual(commitIdTable.F)

    await checkBranch({ ...ctx, commitHash: commitIdTable.G })
    expect(await eGetHeadId()).toEqual(commitIdTable.G)

    await checkBranch({ ...ctx, commitHash: commitIdTable.H })
    expect(await eGetHeadId()).toEqual(commitIdTable.H)

    await checkBranch({ ...ctx, commitHash: commitIdTable.I })
    expect(await eGetHeadId()).toEqual(commitIdTable.I)

    await checkBranch({ ...ctx, commitHash: commitIdTable.J })
    expect(await eGetHeadId()).toEqual(commitIdTable.J)

    await checkBranch({ ...ctx, commitHash: commitIdTable.K })
    expect(await eGetHeadId()).toEqual(commitIdTable.K)

    await checkBranch({ ...ctx, commitHash: 'main' })
    expect(await eGetHeadId()).toEqual('main')
  })

  test('showFileContent', async () => {
    const { commitIdTable } = await buildRepo1({
      repoDir: workspaceDir,
      reporter,
      execaOptions: {},
    })

    // A
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.A, filepath: fpA })).toEqual(
      contentA,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.A, filepath: fpB })).toEqual(
      contentB,
    )

    // B
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.B, filepath: fpA })).toEqual(
      contentA2,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.B, filepath: fpB })).toEqual(
      contentB,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.B, filepath: fpC })).toEqual(
      contentC,
    )

    // C
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.C, filepath: fpB })).toEqual(
      contentB,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.C, filepath: fpC })).toEqual(
      contentC,
    )

    // D
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.D, filepath: fpA })).toEqual(
      contentA,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.D, filepath: fpB })).toEqual(
      contentB,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.D, filepath: fpC })).toEqual(
      contentC2,
    )

    // E
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.E, filepath: fpC })).toEqual(
      contentC2,
    )

    // F
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.F, filepath: fpA })).toEqual(
      contentA,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.F, filepath: fpC })).toEqual(
      contentC2,
    )

    // G
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.G, filepath: fpA })).toEqual(
      contentA2,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.G, filepath: fpB })).toEqual(
      contentB2,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.G, filepath: fpC })).toEqual(
      contentC3,
    )

    // H
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.H, filepath: fpB })).toEqual(
      contentB2,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.H, filepath: fpC })).toEqual(
      contentC3,
    )

    // I
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.I, filepath: fpA })).toEqual(
      contentA2,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.I, filepath: fpB })).toEqual(
      contentB,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.I, filepath: fpC })).toEqual(
      contentC3,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.I, filepath: fpD })).toEqual(
      contentD,
    )

    // J
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.J, filepath: fpA })).toEqual(
      contentA,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.J, filepath: fpB })).toEqual(
      contentB,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.J, filepath: fpC })).toEqual(
      contentC3,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.J, filepath: fpD })).toEqual(
      contentD,
    )

    // K
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.K, filepath: fpA })).toEqual(
      contentA,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.K, filepath: fpB })).toEqual(
      contentB,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.K, filepath: fpC })).toEqual(
      contentC3,
    )
    expect(await showFileContent({ ...ctx, commitHash: commitIdTable.K, filepath: fpE })).toEqual(
      contentD,
    )
  })
})
