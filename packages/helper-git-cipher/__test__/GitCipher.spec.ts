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
const cryptDir = 'encrypted'
const maxTargetFileSize = 1024
const partCodePrefix = '.ghc-part'
const multilineMessagePrefix = '    '

const cryptCommitIdTable = {
  A: '67b26f8e00df18a608e465a5680efd30ced8d02d',
  B: 'b5895a740051257b04f92b1b750b3ba6c709c716',
  C: '07fc2d2b3d1037cc743812c89039f26f99df925c',
  D: '4af9bd6a4700ab759d57d458fe02d335f1c86f29',
  E: '21944054759529758ffe4d6a5106509809807cb1',
  F: '8badc060f441834fa2258a5732647301ceb6d583',
  G: '0d0cab88c672480c3095a04ec24598684bb573b1',
  H: '7ceac78048361b622b67ca249c568d5b3f6386bb',
  I: '7ce10051a0885c345b511d1b479597b620fcdc95',
  J: '7324e4d828e78f4b04386a37c14fd810a57815b5',
  K: '5b43023ea85cbb6d8605a2bb1f0ac27248c9c1ec',
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

  const fileHelper = new BigFileHelper({ partCodePrefix: partCodePrefix })
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
  const gitCipher = new GitCipher({
    cipherBatcher,
    configKeeper,
    logger,
    multilineMessagePrefix,
  })

  const catalog = new FileCipherCatalog({
    pathResolver,
    cryptDir,
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
        {
          id: commitIdTable.J,
          parents: [commitIdTable.I, commitIdTable.H, commitIdTable.F],
        },
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

      expect(logMock.getIndiscriminateAll()).toMatchSnapshot('error log')
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
          {
            id: commitIdTable.J,
            parents: [commitIdTable.I, commitIdTable.H, commitIdTable.F],
          },
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

      expect(logMock.getIndiscriminateAll()).toMatchSnapshot('error log')
    },
    20 * 1000,
  )
})
