import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import {
  FileCipher,
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherPathResolver,
} from '@guanghechen/helper-cipher-file'
import { BigFileHelper } from '@guanghechen/helper-file'
import { emptyDir, rm } from '@guanghechen/helper-fs'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import {
  checkBranch,
  createBranch,
  deleteBranch,
  getAllLocalBranches,
  getCommitInTopology,
  getCommitWithMessageList,
} from '@guanghechen/helper-git'
import { buildRepo1 } from '@guanghechen/helper-git/__test__/_data-repo1'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import { GitCipher, GitCipherConfig } from '../src'

const encoding: BufferEncoding = 'utf8'
const encryptedFilesDir = 'encrypted'
const maxTargetFileSize = 1024
const partCodePrefix = '.ghc-part'

const cryptCommitIdTable = {
  A: '8a2ef34c6fb656ba8797b98bd5425c44b919a636',
  B: '651e984ded8d2c9eab99a54a3ba1b52da7eb2827',
  C: '8deda0dde6b8457740084e5dbf8d3873dec00b91',
  D: '2ccc3343814522c0107297ed59b7a7804a972b7a',
  E: 'ee0dc3b2ef88ee57a9434d28861e88412fc9d43a',
  F: '37bb74f1bde205c4089be1f2a776507c948eb07e',
  G: 'ce04973c1da0b2101c99db4366dbc5cb2dc8be61',
  H: 'f89ff7e68f6caea10f00052201fb40eba5ec3fa7',
  I: '0fcd0445bd47801931b45e94eb035b9a814b1b6f',
  J: '71fde290f9343e90be9d4fe50ea9d2dbc437d4f7',
  K: '61200e851bdbeae43b9e2105b8e05f6377f2dfb2',
}

describe('GitCipher', () => {
  const workspaceDir: string = locateFixtures('__fictitious__GitCipher')
  const plainRootDir: string = path.join(workspaceDir, 'plain')
  const cryptRootDir: string = path.join(workspaceDir, 'crypt')
  const bakRootDir: string = path.join(workspaceDir, 'plain_bak')
  const pathResolver = new FileCipherPathResolver({ plainRootDir, cryptRootDir })
  const bakPathResolver = new FileCipherPathResolver({ plainRootDir: bakRootDir, cryptRootDir })
  const logger = new ChalkLogger({
    name: 'GitCipher',
    level: Level.ERROR,
    flags: { inline: true },
  })

  const plainCtx: IGitCommandBaseParams = { cwd: plainRootDir, logger, execaOptions: {} }
  const cryptCtx: IGitCommandBaseParams = { cwd: cryptRootDir, logger, execaOptions: {} }
  const bakPlainCtx: IGitCommandBaseParams = { cwd: bakRootDir, logger, execaOptions: {} }

  const fileHelper = new BigFileHelper({ partCodePrefix })
  const cipherFactory = new AesCipherFactory()
  const cipher = cipherFactory.initFromPassword(Buffer.from('guanghechen', encoding), {
    salt: 'salt',
    iterations: 100000,
    keylen: 32,
    digest: 'sha256',
  })
  const fileCipher = new FileCipher({ cipher })
  const cipherBatcher = new FileCipherBatcher({
    fileCipher,
    fileHelper,
    maxTargetFileSize,
    logger,
  })

  const configKeeper = new GitCipherConfig({
    cipher,
    filepath: path.join(cryptRootDir, 'catalog.ghc.txt'),
  })
  const gitCipher = new GitCipher({ cipherBatcher, configKeeper, logger })

  const catalog = new FileCipherCatalog({
    pathResolver,
    encryptedFilesDir,
    maxTargetFileSize,
    partCodePrefix,
    logger,
    isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
  })

  let logMock: IConsoleMock
  beforeEach(async () => {
    logMock = createConsoleMock(['error'])
    await emptyDir(workspaceDir)
  })
  afterEach(async () => {
    await configKeeper.remove()
    await rm(workspaceDir)
    logMock.restore()
  })

  test(
    'from scratch',
    async () => {
      const { commitIdTable, commitTable } = await buildRepo1({
        repoDir: plainRootDir,
        logger,
        execaOptions: {},
      })

      // Test encrypt.
      await gitCipher.encrypt({ catalog, pathResolver })
      expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
        currentBranch: 'main',
        branches: ['main'],
      })
      expect(await getCommitInTopology({ ...cryptCtx, branchOrCommitId: 'main' })).toEqual([
        { id: cryptCommitIdTable.A, parents: [] },
        { id: cryptCommitIdTable.B, parents: [cryptCommitIdTable.A] },
        { id: cryptCommitIdTable.C, parents: [cryptCommitIdTable.B] },
        { id: cryptCommitIdTable.D, parents: [cryptCommitIdTable.C] },
        { id: cryptCommitIdTable.E, parents: [cryptCommitIdTable.C] },
        { id: cryptCommitIdTable.F, parents: [cryptCommitIdTable.E, cryptCommitIdTable.D] },
        { id: cryptCommitIdTable.G, parents: [cryptCommitIdTable.B] },
        { id: cryptCommitIdTable.H, parents: [cryptCommitIdTable.G, cryptCommitIdTable.E] },
        { id: cryptCommitIdTable.I, parents: [cryptCommitIdTable.G] },
        {
          id: cryptCommitIdTable.J,
          parents: [cryptCommitIdTable.I, cryptCommitIdTable.H, cryptCommitIdTable.F],
        },
        { id: cryptCommitIdTable.K, parents: [cryptCommitIdTable.J] },
      ])
      expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['main'] })).toEqual([
        { id: cryptCommitIdTable.K, message: `#${commitIdTable.K}` },
        { id: cryptCommitIdTable.J, message: `#${commitIdTable.J}` },
        { id: cryptCommitIdTable.I, message: `#${commitIdTable.I}` },
        { id: cryptCommitIdTable.H, message: `#${commitIdTable.H}` },
        { id: cryptCommitIdTable.G, message: `#${commitIdTable.G}` },
        { id: cryptCommitIdTable.F, message: `#${commitIdTable.F}` },
        { id: cryptCommitIdTable.E, message: `#${commitIdTable.E}` },
        { id: cryptCommitIdTable.D, message: `#${commitIdTable.D}` },
        { id: cryptCommitIdTable.C, message: `#${commitIdTable.C}` },
        { id: cryptCommitIdTable.B, message: `#${commitIdTable.B}` },
        { id: cryptCommitIdTable.A, message: `#${commitIdTable.A}` },
      ])

      // Test decrypt.
      await gitCipher.decrypt({ pathResolver: bakPathResolver })
      expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
        currentBranch: 'main',
        branches: ['main'],
      })
      expect(await getCommitInTopology({ ...bakPlainCtx, branchOrCommitId: 'main' })).toEqual([
        { id: commitIdTable.A, parents: [] },
        { id: commitIdTable.B, parents: [commitIdTable.A] },
        { id: commitIdTable.C, parents: [commitIdTable.B] },
        { id: commitIdTable.D, parents: [commitIdTable.C] },
        { id: commitIdTable.E, parents: [commitIdTable.C] },
        { id: commitIdTable.F, parents: [commitIdTable.E, commitIdTable.D] },
        { id: commitIdTable.G, parents: [commitIdTable.B] },
        { id: commitIdTable.H, parents: [commitIdTable.G, commitIdTable.E] },
        { id: commitIdTable.I, parents: [commitIdTable.G] },
        { id: commitIdTable.J, parents: [commitIdTable.I, commitIdTable.H, commitIdTable.F] },
        { id: commitIdTable.K, parents: [commitIdTable.J] },
      ])
      expect(
        await getCommitWithMessageList({ ...bakPlainCtx, branchOrCommitIds: ['main'] }),
      ).toEqual([
        { id: commitIdTable.K, message: commitTable.K.message },
        { id: commitIdTable.J, message: commitTable.J.message },
        { id: commitIdTable.I, message: commitTable.I.message },
        { id: commitIdTable.H, message: commitTable.H.message },
        { id: commitIdTable.G, message: commitTable.G.message },
        { id: commitIdTable.F, message: commitTable.F.message },
        { id: commitIdTable.E, message: commitTable.E.message },
        { id: commitIdTable.D, message: commitTable.D.message },
        { id: commitIdTable.C, message: commitTable.C.message },
        { id: commitIdTable.B, message: commitTable.B.message },
        { id: commitIdTable.A, message: commitTable.A.message },
      ])

      expect(logMock.getIndiscriminateAll()).toEqual([
        [
          '[safeExeca] failed to run:',
          'git',
          `merge ${commitIdTable.G} ${commitIdTable.E} -m '${commitTable.H.message}'`,
        ],
      ])
    },
    20 * 1000,
  )

  test(
    'incremental update',
    async () => {
      const { commitIdTable, commitTable } = await buildRepo1({
        repoDir: plainRootDir,
        logger,
        execaOptions: {},
      })

      // Commit E.
      {
        await checkBranch({ ...plainCtx, branchOrCommitId: commitIdTable.E })
        await deleteBranch({ ...plainCtx, branchName: 'main', force: true })
        await createBranch({ ...plainCtx, newBranchName: 'E', branchOrCommitId: commitIdTable.E })
        await checkBranch({ ...plainCtx, branchOrCommitId: 'E' })

        // Test encrypt.
        await gitCipher.encrypt({ catalog, pathResolver })
        expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
          currentBranch: 'E',
          branches: ['E'],
        })
        expect(await getCommitInTopology({ ...cryptCtx, branchOrCommitId: 'E' })).toEqual([
          { id: cryptCommitIdTable.A, parents: [] },
          { id: cryptCommitIdTable.B, parents: [cryptCommitIdTable.A] },
          { id: cryptCommitIdTable.C, parents: [cryptCommitIdTable.B] },
          { id: cryptCommitIdTable.E, parents: [cryptCommitIdTable.C] },
        ])
        expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['E'] })).toEqual([
          { id: cryptCommitIdTable.E, message: `#${commitIdTable.E}` },
          { id: cryptCommitIdTable.C, message: `#${commitIdTable.C}` },
          { id: cryptCommitIdTable.B, message: `#${commitIdTable.B}` },
          { id: cryptCommitIdTable.A, message: `#${commitIdTable.A}` },
        ])

        // Test Decrypt
        await gitCipher.decrypt({ pathResolver: bakPathResolver })
        expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
          currentBranch: 'E',
          branches: ['E'],
        })
        expect(await getCommitInTopology({ ...bakPlainCtx, branchOrCommitId: 'E' })).toEqual([
          { id: commitIdTable.A, parents: [] },
          { id: commitIdTable.B, parents: [commitIdTable.A] },
          { id: commitIdTable.C, parents: [commitIdTable.B] },
          { id: commitIdTable.E, parents: [commitIdTable.C] },
        ])
        expect(
          await getCommitWithMessageList({ ...bakPlainCtx, branchOrCommitIds: ['E'] }),
        ).toEqual([
          { id: commitIdTable.E, message: commitTable.E.message },
          { id: commitIdTable.C, message: commitTable.C.message },
          { id: commitIdTable.B, message: commitTable.B.message },
          { id: commitIdTable.A, message: commitTable.A.message },
        ])
      }

      // Commit I
      {
        await createBranch({ ...plainCtx, newBranchName: 'I', branchOrCommitId: commitIdTable.I })

        // Test encrypt.
        await gitCipher.encrypt({ catalog, pathResolver })
        expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
          currentBranch: 'E',
          branches: ['E', 'I'],
        })
        expect(await getCommitInTopology({ ...cryptCtx, branchOrCommitId: 'I' })).toEqual([
          { id: cryptCommitIdTable.A, parents: [] },
          { id: cryptCommitIdTable.B, parents: [cryptCommitIdTable.A] },
          { id: cryptCommitIdTable.G, parents: [cryptCommitIdTable.B] },
          { id: cryptCommitIdTable.I, parents: [cryptCommitIdTable.G] },
        ])
        expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['I'] })).toEqual([
          { id: cryptCommitIdTable.I, message: `#${commitIdTable.I}` },
          { id: cryptCommitIdTable.G, message: `#${commitIdTable.G}` },
          { id: cryptCommitIdTable.B, message: `#${commitIdTable.B}` },
          { id: cryptCommitIdTable.A, message: `#${commitIdTable.A}` },
        ])

        // Test Decrypt
        await gitCipher.decrypt({ pathResolver: bakPathResolver })
        expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
          currentBranch: 'E',
          branches: ['E', 'I'],
        })
        expect(await getCommitInTopology({ ...bakPlainCtx, branchOrCommitId: 'I' })).toEqual([
          { id: commitIdTable.A, parents: [] },
          { id: commitIdTable.B, parents: [commitIdTable.A] },
          { id: commitIdTable.G, parents: [commitIdTable.B] },
          { id: commitIdTable.I, parents: [commitIdTable.G] },
        ])
        expect(
          await getCommitWithMessageList({ ...bakPlainCtx, branchOrCommitIds: ['I'] }),
        ).toEqual([
          { id: commitIdTable.I, message: commitTable.I.message },
          { id: commitIdTable.G, message: commitTable.G.message },
          { id: commitIdTable.B, message: commitTable.B.message },
          { id: commitIdTable.A, message: commitTable.A.message },
        ])
      }

      // Commit K
      {
        await createBranch({ ...plainCtx, newBranchName: 'K', branchOrCommitId: commitIdTable.K })
        await checkBranch({ ...plainCtx, branchOrCommitId: 'K' })

        // Test encrypt.
        await gitCipher.encrypt({ catalog, pathResolver })
        expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
          currentBranch: 'K',
          branches: ['E', 'I', 'K'],
        })
        expect(await getCommitInTopology({ ...cryptCtx, branchOrCommitId: 'K' })).toEqual([
          { id: cryptCommitIdTable.A, parents: [] },
          { id: cryptCommitIdTable.B, parents: [cryptCommitIdTable.A] },
          { id: cryptCommitIdTable.C, parents: [cryptCommitIdTable.B] },
          { id: cryptCommitIdTable.D, parents: [cryptCommitIdTable.C] },
          { id: cryptCommitIdTable.E, parents: [cryptCommitIdTable.C] },
          { id: cryptCommitIdTable.F, parents: [cryptCommitIdTable.E, cryptCommitIdTable.D] },
          { id: cryptCommitIdTable.G, parents: [cryptCommitIdTable.B] },
          { id: cryptCommitIdTable.H, parents: [cryptCommitIdTable.G, cryptCommitIdTable.E] },
          { id: cryptCommitIdTable.I, parents: [cryptCommitIdTable.G] },
          {
            id: cryptCommitIdTable.J,
            parents: [cryptCommitIdTable.I, cryptCommitIdTable.H, cryptCommitIdTable.F],
          },
          { id: cryptCommitIdTable.K, parents: [cryptCommitIdTable.J] },
        ])
        expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['K'] })).toEqual([
          { id: cryptCommitIdTable.K, message: `#${commitIdTable.K}` },
          { id: cryptCommitIdTable.J, message: `#${commitIdTable.J}` },
          { id: cryptCommitIdTable.I, message: `#${commitIdTable.I}` },
          { id: cryptCommitIdTable.H, message: `#${commitIdTable.H}` },
          { id: cryptCommitIdTable.G, message: `#${commitIdTable.G}` },
          { id: cryptCommitIdTable.F, message: `#${commitIdTable.F}` },
          { id: cryptCommitIdTable.E, message: `#${commitIdTable.E}` },
          { id: cryptCommitIdTable.D, message: `#${commitIdTable.D}` },
          { id: cryptCommitIdTable.C, message: `#${commitIdTable.C}` },
          { id: cryptCommitIdTable.B, message: `#${commitIdTable.B}` },
          { id: cryptCommitIdTable.A, message: `#${commitIdTable.A}` },
        ])

        // Test Decrypt
        await gitCipher.decrypt({ pathResolver: bakPathResolver })
        expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
          currentBranch: 'K',
          branches: ['E', 'I', 'K'],
        })
        expect(await getCommitInTopology({ ...bakPlainCtx, branchOrCommitId: 'K' })).toEqual([
          { id: commitIdTable.A, parents: [] },
          { id: commitIdTable.B, parents: [commitIdTable.A] },
          { id: commitIdTable.C, parents: [commitIdTable.B] },
          { id: commitIdTable.D, parents: [commitIdTable.C] },
          { id: commitIdTable.E, parents: [commitIdTable.C] },
          { id: commitIdTable.F, parents: [commitIdTable.E, commitIdTable.D] },
          { id: commitIdTable.G, parents: [commitIdTable.B] },
          { id: commitIdTable.H, parents: [commitIdTable.G, commitIdTable.E] },
          { id: commitIdTable.I, parents: [commitIdTable.G] },
          { id: commitIdTable.J, parents: [commitIdTable.I, commitIdTable.H, commitIdTable.F] },
          { id: commitIdTable.K, parents: [commitIdTable.J] },
        ])
        expect(
          await getCommitWithMessageList({ ...bakPlainCtx, branchOrCommitIds: ['K'] }),
        ).toEqual([
          { id: commitIdTable.K, message: commitTable.K.message },
          { id: commitIdTable.J, message: commitTable.J.message },
          { id: commitIdTable.I, message: commitTable.I.message },
          { id: commitIdTable.H, message: commitTable.H.message },
          { id: commitIdTable.G, message: commitTable.G.message },
          { id: commitIdTable.F, message: commitTable.F.message },
          { id: commitIdTable.E, message: commitTable.E.message },
          { id: commitIdTable.D, message: commitTable.D.message },
          { id: commitIdTable.C, message: commitTable.C.message },
          { id: commitIdTable.B, message: commitTable.B.message },
          { id: commitIdTable.A, message: commitTable.A.message },
        ])
      }

      expect(logMock.getIndiscriminateAll()).toEqual([
        [
          '[safeExeca] failed to run:',
          'git',
          `merge ${commitIdTable.G} ${commitIdTable.E} -m '${commitTable.H.message}'`,
        ],
      ])
    },
    20 * 1000,
  )
})
