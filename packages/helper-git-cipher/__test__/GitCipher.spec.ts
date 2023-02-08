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
import type { ILoggerMock } from '@guanghechen/helper-jest'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { desensitize, locateFixtures } from 'jest.helper'
import path from 'node:path'
import { GitCipher, GitCipherConfig } from '../src'
import {
  buildRepo1,
  encoding,
  encryptedFilesDir,
  maxTargetFileSize,
  partCodePrefix,
  repo1CryptCommitIdTable,
} from './_data-repo1'

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
    flags: { inline: true, colorful: false },
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
    encryptedFilePathSalt: 'guanghechen_git_cipher',
    maxTargetFileSize,
    partCodePrefix,
    logger,
    isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
  })

  let logMock: ILoggerMock
  beforeEach(async () => {
    logMock = createLoggerMock({ logger, desensitize })
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
        { id: repo1CryptCommitIdTable.A, parents: [] },
        { id: repo1CryptCommitIdTable.B, parents: [repo1CryptCommitIdTable.A] },
        { id: repo1CryptCommitIdTable.C, parents: [repo1CryptCommitIdTable.B] },
        { id: repo1CryptCommitIdTable.D, parents: [repo1CryptCommitIdTable.C] },
        { id: repo1CryptCommitIdTable.E, parents: [repo1CryptCommitIdTable.C] },
        {
          id: repo1CryptCommitIdTable.F,
          parents: [repo1CryptCommitIdTable.E, repo1CryptCommitIdTable.D],
        },
        { id: repo1CryptCommitIdTable.G, parents: [repo1CryptCommitIdTable.B] },
        {
          id: repo1CryptCommitIdTable.H,
          parents: [repo1CryptCommitIdTable.G, repo1CryptCommitIdTable.E],
        },
        { id: repo1CryptCommitIdTable.I, parents: [repo1CryptCommitIdTable.G] },
        {
          id: repo1CryptCommitIdTable.J,
          parents: [
            repo1CryptCommitIdTable.I,
            repo1CryptCommitIdTable.H,
            repo1CryptCommitIdTable.F,
          ],
        },
        { id: repo1CryptCommitIdTable.K, parents: [repo1CryptCommitIdTable.J] },
      ])
      expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['main'] })).toEqual([
        { id: repo1CryptCommitIdTable.K, message: `#${commitIdTable.K}` },
        { id: repo1CryptCommitIdTable.J, message: `#${commitIdTable.J}` },
        { id: repo1CryptCommitIdTable.I, message: `#${commitIdTable.I}` },
        { id: repo1CryptCommitIdTable.H, message: `#${commitIdTable.H}` },
        { id: repo1CryptCommitIdTable.G, message: `#${commitIdTable.G}` },
        { id: repo1CryptCommitIdTable.F, message: `#${commitIdTable.F}` },
        { id: repo1CryptCommitIdTable.E, message: `#${commitIdTable.E}` },
        { id: repo1CryptCommitIdTable.D, message: `#${commitIdTable.D}` },
        { id: repo1CryptCommitIdTable.C, message: `#${commitIdTable.C}` },
        { id: repo1CryptCommitIdTable.B, message: `#${commitIdTable.B}` },
        { id: repo1CryptCommitIdTable.A, message: `#${commitIdTable.A}` },
      ])
      expect(await getAllLocalBranches(plainCtx)).toEqual({
        currentBranch: 'main',
        branches: ['main'],
      })

      // Test decrypt.
      await gitCipher.decrypt({ pathResolver: bakPathResolver })
      expect(await getAllLocalBranches(bakPlainCtx)).toEqual({
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
      expect(await getAllLocalBranches(cryptCtx)).toEqual({
        currentBranch: 'main',
        branches: ['main'],
      })

      expect(logMock.getIndiscriminateAll()).toEqual([
        [
          "error [GitCipher] [safeExeca] failed to run git.  args: ['merge','06d25f06c6cd40756bf61624f1ee37bf014ec6d0','28fc4e74bf3bc436c21774dfc9947d60116d9716','-m','H -- Merge E and G <conflict> (b2,c3)']  options: {cwd:'<$WORKSPACE$>/packages/helper-git-cipher/__test__/fixtures/__fictitious__GitCipher/plain',env:{GIT_AUTHOR_DATE:'<$Date$> +0800',GIT_COMMITTER_DATE:'2023-01-27 15:00:08 +0800',GIT_AUTHOR_NAME:'guanghechen_h',GIT_COMMITTER_NAME:'guanghechen_h',GIT_AUTHOR_EMAIL:'exmaple_h@gmail.com',GIT_COMMITTER_EMAIL:'exmaple_h@gmail.com'},extendEnv:true,encoding:'utf8'}\n",
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
          { id: repo1CryptCommitIdTable.A, parents: [] },
          { id: repo1CryptCommitIdTable.B, parents: [repo1CryptCommitIdTable.A] },
          { id: repo1CryptCommitIdTable.C, parents: [repo1CryptCommitIdTable.B] },
          { id: repo1CryptCommitIdTable.E, parents: [repo1CryptCommitIdTable.C] },
        ])
        expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['E'] })).toEqual([
          { id: repo1CryptCommitIdTable.E, message: `#${commitIdTable.E}` },
          { id: repo1CryptCommitIdTable.C, message: `#${commitIdTable.C}` },
          { id: repo1CryptCommitIdTable.B, message: `#${commitIdTable.B}` },
          { id: repo1CryptCommitIdTable.A, message: `#${commitIdTable.A}` },
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
          { id: repo1CryptCommitIdTable.A, parents: [] },
          { id: repo1CryptCommitIdTable.B, parents: [repo1CryptCommitIdTable.A] },
          { id: repo1CryptCommitIdTable.G, parents: [repo1CryptCommitIdTable.B] },
          { id: repo1CryptCommitIdTable.I, parents: [repo1CryptCommitIdTable.G] },
        ])
        expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['I'] })).toEqual([
          { id: repo1CryptCommitIdTable.I, message: `#${commitIdTable.I}` },
          { id: repo1CryptCommitIdTable.G, message: `#${commitIdTable.G}` },
          { id: repo1CryptCommitIdTable.B, message: `#${commitIdTable.B}` },
          { id: repo1CryptCommitIdTable.A, message: `#${commitIdTable.A}` },
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
          { id: repo1CryptCommitIdTable.A, parents: [] },
          { id: repo1CryptCommitIdTable.B, parents: [repo1CryptCommitIdTable.A] },
          { id: repo1CryptCommitIdTable.C, parents: [repo1CryptCommitIdTable.B] },
          { id: repo1CryptCommitIdTable.D, parents: [repo1CryptCommitIdTable.C] },
          { id: repo1CryptCommitIdTable.E, parents: [repo1CryptCommitIdTable.C] },
          {
            id: repo1CryptCommitIdTable.F,
            parents: [repo1CryptCommitIdTable.E, repo1CryptCommitIdTable.D],
          },
          { id: repo1CryptCommitIdTable.G, parents: [repo1CryptCommitIdTable.B] },
          {
            id: repo1CryptCommitIdTable.H,
            parents: [repo1CryptCommitIdTable.G, repo1CryptCommitIdTable.E],
          },
          { id: repo1CryptCommitIdTable.I, parents: [repo1CryptCommitIdTable.G] },
          {
            id: repo1CryptCommitIdTable.J,
            parents: [
              repo1CryptCommitIdTable.I,
              repo1CryptCommitIdTable.H,
              repo1CryptCommitIdTable.F,
            ],
          },
          { id: repo1CryptCommitIdTable.K, parents: [repo1CryptCommitIdTable.J] },
        ])
        expect(await getCommitWithMessageList({ ...cryptCtx, branchOrCommitIds: ['K'] })).toEqual([
          { id: repo1CryptCommitIdTable.K, message: `#${commitIdTable.K}` },
          { id: repo1CryptCommitIdTable.J, message: `#${commitIdTable.J}` },
          { id: repo1CryptCommitIdTable.I, message: `#${commitIdTable.I}` },
          { id: repo1CryptCommitIdTable.H, message: `#${commitIdTable.H}` },
          { id: repo1CryptCommitIdTable.G, message: `#${commitIdTable.G}` },
          { id: repo1CryptCommitIdTable.F, message: `#${commitIdTable.F}` },
          { id: repo1CryptCommitIdTable.E, message: `#${commitIdTable.E}` },
          { id: repo1CryptCommitIdTable.D, message: `#${commitIdTable.D}` },
          { id: repo1CryptCommitIdTable.C, message: `#${commitIdTable.C}` },
          { id: repo1CryptCommitIdTable.B, message: `#${commitIdTable.B}` },
          { id: repo1CryptCommitIdTable.A, message: `#${commitIdTable.A}` },
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
          "error [GitCipher] [safeExeca] failed to run git.  args: ['merge','06d25f06c6cd40756bf61624f1ee37bf014ec6d0','28fc4e74bf3bc436c21774dfc9947d60116d9716','-m','H -- Merge E and G <conflict> (b2,c3)']  options: {cwd:'<$WORKSPACE$>/packages/helper-git-cipher/__test__/fixtures/__fictitious__GitCipher/plain',env:{GIT_AUTHOR_DATE:'<$Date$> +0800',GIT_COMMITTER_DATE:'2023-01-27 15:00:08 +0800',GIT_AUTHOR_NAME:'guanghechen_h',GIT_COMMITTER_NAME:'guanghechen_h',GIT_AUTHOR_EMAIL:'exmaple_h@gmail.com',GIT_COMMITTER_EMAIL:'exmaple_h@gmail.com'},extendEnv:true,encoding:'utf8'}\n",
        ],
      ])
    },
    20 * 1000,
  )
})
