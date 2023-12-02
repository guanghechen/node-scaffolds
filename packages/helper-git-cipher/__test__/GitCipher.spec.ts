import { bytes2text } from '@guanghechen/byte'
import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import type { ICatalogItem } from '@guanghechen/cipher-workspace.types'
import { FileSplitter } from '@guanghechen/file-split'
import {
  CipherCatalogContext,
  FileCipherBatcher,
  FileCipherFactory,
} from '@guanghechen/helper-cipher-file'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import {
  checkBranch,
  createBranch,
  deleteBranch,
  getAllLocalBranches,
  getCommitInTopology,
  getCommitWithMessageList,
} from '@guanghechen/helper-git'
import type { IReporterMock } from '@guanghechen/helper-jest'
import { createReporterMock } from '@guanghechen/helper-jest'
import { calcMac } from '@guanghechen/mac'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import { TextFileResource } from '@guanghechen/resource'
import {
  assertPromiseNotThrow,
  assertPromiseThrow,
  collectAllFilesSync,
  desensitize,
  emptyDir,
  locateFixtures,
  rm,
} from 'jest.helper'
import fs from 'node:fs/promises'
import path from 'node:path'
import { GitCipher, GitCipherConfigKeeper, verifyCryptGitCommit } from '../src'
import { GitCipherContext } from '../src/GitCipherContext'
import type { IBuildRepo1Result } from './_data-repo1'
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
  contentHashAlgorithm,
  cryptFilesDir,
  diffItemsTable,
  encoding,
  fpA,
  fpB,
  fpC,
  fpD,
  fpE,
  itemTable,
  maxTargetFileSize,
  partCodePrefix,
  pathHashAlgorithm,
  repo1CryptCommitIdTable,
  repo1CryptCommitMessageTable,
} from './_data-repo1'

describe('GitCipher', () => {
  const workspaceDir: string = locateFixtures('__fictitious__GitCipher')
  const plainRootDir: string = path.join(workspaceDir, 'plain')
  const cryptRootDir: string = path.join(workspaceDir, 'crypt')
  const bakPlainRootDir: string = path.join(workspaceDir, 'plain_bak')

  const reporter = new ChalkLogger({
    name: 'GitCipher',
    level: Level.ERROR,
    flights: { inline: true, colorful: false },
  })

  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)
  const cryptPathResolver = new WorkspacePathResolver(cryptRootDir, pathResolver)
  const bakPlainPathResolver = new WorkspacePathResolver(bakPlainRootDir, pathResolver)
  const plainCtx: IGitCommandBaseParams = { cwd: plainRootDir, reporter, execaOptions: {} }
  const cryptCtx: IGitCommandBaseParams = { cwd: cryptRootDir, reporter, execaOptions: {} }
  const bakPlainCtx: IGitCommandBaseParams = { cwd: bakPlainRootDir, reporter, execaOptions: {} }

  let resource: TextFileResource
  let configKeeper: GitCipherConfigKeeper
  let gitCipher: GitCipher
  let bakGitCipher: GitCipher

  beforeAll(() => {
    const ivSize = 12
    const cipherFactory = new AesGcmCipherFactoryBuilder({ ivSize }).buildFromPassword(
      Buffer.from('guanghechen', encoding),
      {
        salt: 'salt',
        iterations: 100000,
        digest: 'sha256',
      },
    )
    resource = new TextFileResource({
      strict: true,
      filepath: path.join(cryptRootDir, 'catalog.ghc.txt'),
      encoding: 'utf8',
    })
    configKeeper = new GitCipherConfigKeeper({ resource, cipher: cipherFactory.cipher() })

    const fileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })
    const fileSplitter = new FileSplitter({ partCodePrefix })
    const cipherBatcher = new FileCipherBatcher({
      fileCipherFactory,
      fileSplitter,
      maxTargetFileSize,
      reporter,
    })

    {
      // build gitCipher
      const catalogContext = new CipherCatalogContext({
        contentHashAlgorithm,
        cryptFilesDir,
        cryptFilepathSalt: 'guanghechen_git_cipher',
        cryptPathResolver,
        maxTargetFileSize,
        partCodePrefix,
        pathHashAlgorithm,
        plainPathResolver,
        isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
        calcIv: info => calcMac(info, 'sha256').slice(0, ivSize),
      })
      const context = new GitCipherContext({
        catalogContext,
        cipherBatcher,
        configKeeper,
        reporter,
        calcIv: (infos): Readonly<Uint8Array> => calcMac(infos, 'sha256').slice(0, ivSize),
      })
      gitCipher = new GitCipher({ context })
    }

    {
      // build bakGitCipher
      const catalogContext = new CipherCatalogContext({
        contentHashAlgorithm,
        cryptFilesDir,
        cryptFilepathSalt: 'guanghechen_git_cipher',
        cryptPathResolver,
        maxTargetFileSize,
        partCodePrefix,
        pathHashAlgorithm,
        plainPathResolver: bakPlainPathResolver,
        isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
        calcIv: info => calcMac(info, 'sha256').slice(0, ivSize),
      })
      const context = new GitCipherContext({
        catalogContext,
        cipherBatcher,
        configKeeper,
        reporter,
        calcIv: (infos): Readonly<Uint8Array> => calcMac(infos, 'sha256').slice(0, ivSize),
      })
      bakGitCipher = new GitCipher({ context })
    }
  })

  const testCatalog = async (
    commit: { message: string; cryptParents: string[] },
    diffItems: unknown[],
    items: ICatalogItem[],
  ): Promise<void> => {
    const { context } = gitCipher
    await configKeeper.load()
    expect(configKeeper.data!.commit).toEqual({ message: commit.message })
    expect(
      configKeeper.data!.catalog.items.map(item => ({
        ...item,
        cryptFilepath: context.catalog.calcCryptFilepath(item.plainFilepath),
        iv: bytes2text(context.getIv(item), 'hex'),
        authTag: item.authTag ? bytes2text(item.authTag, 'hex') : undefined,
      })),
    ).toEqual(
      items.map(item => ({
        ...item,
        iv: item.iv ? bytes2text(item.iv, 'hex') : undefined,
        authTag: item.authTag ? bytes2text(item.authTag, 'hex') : undefined,
      })),
    )

    expect(
      configKeeper.data!.catalog.diffItems.map(diffItem => {
        const serializeItem = (item: any): any => ({
          plainFilepath: item.plainFilepath,
          fingerprint: item.fingerprint,
          cryptFilepathParts: item.cryptFilepathParts,
          keepPlain: item.keepPlain,
          iv: bytes2text(context.getIv(item), 'hex'),
          authTag: item.authTag ? bytes2text(item.authTag, 'hex') : undefined,
        })

        const result: any = { ...diffItem }
        if (result.oldItem) result.oldItem = serializeItem(result.oldItem)
        if (result.newItem) result.newItem = serializeItem(result.newItem)
        return result
      }),
    ).toEqual(
      diffItems.map((diffItem: any): any => {
        const serializeItem = (item: any): any => ({
          plainFilepath: item.plainFilepath,
          fingerprint: item.fingerprint,
          cryptFilepathParts: item.cryptFilepathParts,
          keepPlain: item.keepPlain,
          iv: item.iv ? bytes2text(item.iv, 'hex') : undefined,
          authTag: item.authTag ? bytes2text(item.authTag, 'hex') : undefined,
        })

        const result: any = { ...diffItem }
        if (result.oldItem) result.oldItem = serializeItem(result.oldItem)
        if (result.newItem) result.newItem = serializeItem(result.newItem)
        return result
      }),
    )
  }

  describe('complex', () => {
    let logMock: IReporterMock
    beforeEach(async () => {
      logMock = createReporterMock({ reporter, desensitize })
      await emptyDir(workspaceDir)
    })
    afterEach(async () => {
      await configKeeper.destroy()
      await rm(workspaceDir)
      logMock.restore()
    })

    test(
      'from scratch',
      async () => {
        const { commitIdTable, commitTable } = await buildRepo1({
          repoDir: plainRootDir,
          reporter,
          execaOptions: {},
        })

        // Test encrypt.
        let { crypt2plainIdMap } = await gitCipher.encrypt({ crypt2plainIdMap: new Map() })
        expect(crypt2plainIdMap).toEqual(
          new Map([
            [repo1CryptCommitIdTable.A, commitIdTable.A],
            [repo1CryptCommitIdTable.B, commitIdTable.B],
            [repo1CryptCommitIdTable.C, commitIdTable.C],
            [repo1CryptCommitIdTable.D, commitIdTable.D],
            [repo1CryptCommitIdTable.E, commitIdTable.E],
            [repo1CryptCommitIdTable.F, commitIdTable.F],
            [repo1CryptCommitIdTable.G, commitIdTable.G],
            [repo1CryptCommitIdTable.H, commitIdTable.H],
            [repo1CryptCommitIdTable.I, commitIdTable.I],
            [repo1CryptCommitIdTable.J, commitIdTable.J],
            [repo1CryptCommitIdTable.K, commitIdTable.K],
          ]),
        )
        expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
          currentBranch: 'main',
          branches: ['main'],
        })
        expect(await getCommitInTopology({ ...cryptCtx, commitHash: 'main' })).toEqual([
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
        expect(await getCommitWithMessageList({ ...cryptCtx, commitHashes: ['main'] })).toEqual([
          { id: repo1CryptCommitIdTable.K, message: repo1CryptCommitMessageTable.K },
          { id: repo1CryptCommitIdTable.J, message: repo1CryptCommitMessageTable.J },
          { id: repo1CryptCommitIdTable.I, message: repo1CryptCommitMessageTable.I },
          { id: repo1CryptCommitIdTable.H, message: repo1CryptCommitMessageTable.H },
          { id: repo1CryptCommitIdTable.G, message: repo1CryptCommitMessageTable.G },
          { id: repo1CryptCommitIdTable.F, message: repo1CryptCommitMessageTable.F },
          { id: repo1CryptCommitIdTable.E, message: repo1CryptCommitMessageTable.E },
          { id: repo1CryptCommitIdTable.D, message: repo1CryptCommitMessageTable.D },
          { id: repo1CryptCommitIdTable.C, message: repo1CryptCommitMessageTable.C },
          { id: repo1CryptCommitIdTable.B, message: repo1CryptCommitMessageTable.B },
          { id: repo1CryptCommitIdTable.A, message: repo1CryptCommitMessageTable.A },
        ])
        expect(await getAllLocalBranches(plainCtx)).toEqual({
          currentBranch: 'main',
          branches: ['main'],
        })

        // Check catalog.
        await testCatalog(
          { message: commitTable.K.message, cryptParents: [repo1CryptCommitIdTable.J] },
          diffItemsTable.stepK,
          [itemTable.A, itemTable.B, itemTable.C3, itemTable.E],
        )

        // Verify
        for (const symbol of Object.keys(repo1CryptCommitIdTable) as Array<
          keyof typeof repo1CryptCommitIdTable
        >) {
          await assertPromiseNotThrow(() =>
            gitCipher.verifyCommit({
              cryptCommitId: repo1CryptCommitIdTable[symbol],
              plainCommitId: commitIdTable[symbol],
            }),
          )

          await assertPromiseNotThrow(() =>
            verifyCryptGitCommit({
              catalog: gitCipher.context.catalog,
              catalogFilepath: resource.filepath,
              configKeeper,
              cryptCommitId: repo1CryptCommitIdTable[symbol],
              reporter,
            }),
          )
        }

        // Test decrypt.
        crypt2plainIdMap = await bakGitCipher
          .decrypt({ crypt2plainIdMap, gpgSign: false })
          .then(md => md.crypt2plainIdMap)
        expect(crypt2plainIdMap).toEqual(
          new Map([
            [repo1CryptCommitIdTable.A, commitIdTable.A],
            [repo1CryptCommitIdTable.B, commitIdTable.B],
            [repo1CryptCommitIdTable.C, commitIdTable.C],
            [repo1CryptCommitIdTable.D, commitIdTable.D],
            [repo1CryptCommitIdTable.E, commitIdTable.E],
            [repo1CryptCommitIdTable.F, commitIdTable.F],
            [repo1CryptCommitIdTable.G, commitIdTable.G],
            [repo1CryptCommitIdTable.H, commitIdTable.H],
            [repo1CryptCommitIdTable.I, commitIdTable.I],
            [repo1CryptCommitIdTable.J, commitIdTable.J],
            [repo1CryptCommitIdTable.K, commitIdTable.K],
          ]),
        )
        expect(await getAllLocalBranches(bakPlainCtx)).toEqual({
          currentBranch: 'main',
          branches: ['main'],
        })
        expect(await getCommitInTopology({ ...bakPlainCtx, commitHash: 'main' })).toEqual([
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
        expect(await getCommitWithMessageList({ ...bakPlainCtx, commitHashes: ['main'] })).toEqual([
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
  })

  describe('incremental update', () => {
    let logMock: IReporterMock
    let crypt2plainIdMap: Map<string, string>
    let commitIdTable: Readonly<IBuildRepo1Result['commitIdTable']>
    let commitTable: Readonly<IBuildRepo1Result['commitTable']>

    beforeAll(async () => {
      logMock = createReporterMock({ reporter, desensitize })
      crypt2plainIdMap = new Map()
      await emptyDir(workspaceDir)

      const buildRepo1Result: IBuildRepo1Result = await buildRepo1({
        repoDir: plainRootDir,
        reporter,
        execaOptions: {},
      })
      commitIdTable = buildRepo1Result.commitIdTable
      commitTable = buildRepo1Result.commitTable
    })

    afterAll(async () => {
      await configKeeper.destroy()
      await rm(workspaceDir)
      logMock.restore()
      crypt2plainIdMap.clear()
    })

    test('commit A', async () => {
      await checkBranch({ ...plainCtx, commitHash: commitIdTable.A })
      await createBranch({ ...plainCtx, newBranchName: 'A', commitHash: commitIdTable.A })
      await checkBranch({ ...plainCtx, commitHash: 'A' })

      // Test encrypt.
      crypt2plainIdMap = await gitCipher
        .encrypt({ crypt2plainIdMap })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
        currentBranch: 'A',
        branches: ['A', 'main'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.D, commitIdTable.D],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
          [repo1CryptCommitIdTable.F, commitIdTable.F],
          [repo1CryptCommitIdTable.G, commitIdTable.G],
          [repo1CryptCommitIdTable.H, commitIdTable.H],
          [repo1CryptCommitIdTable.I, commitIdTable.I],
          [repo1CryptCommitIdTable.J, commitIdTable.J],
          [repo1CryptCommitIdTable.K, commitIdTable.K],
        ]),
      )
      expect(await getCommitInTopology({ ...cryptCtx, commitHash: 'A' })).toEqual([
        { id: repo1CryptCommitIdTable.A, parents: [] },
      ])
      expect(await getCommitWithMessageList({ ...cryptCtx, commitHashes: ['A'] })).toEqual([
        { id: repo1CryptCommitIdTable.A, message: repo1CryptCommitMessageTable.A },
      ])

      // Check catalog.
      await testCatalog(
        { message: commitTable.A.message, cryptParents: [] },
        diffItemsTable.stepA,
        [itemTable.A, itemTable.B],
      )

      // Test Decrypt
      crypt2plainIdMap = await bakGitCipher
        .decrypt({ crypt2plainIdMap, gpgSign: false })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
        currentBranch: 'A',
        branches: ['A', 'main'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.D, commitIdTable.D],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
          [repo1CryptCommitIdTable.F, commitIdTable.F],
          [repo1CryptCommitIdTable.G, commitIdTable.G],
          [repo1CryptCommitIdTable.H, commitIdTable.H],
          [repo1CryptCommitIdTable.I, commitIdTable.I],
          [repo1CryptCommitIdTable.J, commitIdTable.J],
          [repo1CryptCommitIdTable.K, commitIdTable.K],
        ]),
      )
      expect(await getCommitInTopology({ ...bakPlainCtx, commitHash: 'A' })).toEqual([
        { id: commitIdTable.A, parents: [] },
      ])
      expect(await getCommitWithMessageList({ ...bakPlainCtx, commitHashes: ['A'] })).toEqual([
        { id: commitIdTable.A, message: commitTable.A.message },
      ])

      // Delete the branch 'A' and recover the workspace.
      await checkBranch({ ...plainCtx, commitHash: commitIdTable.A })
      await deleteBranch({ ...plainCtx, branchName: 'A', force: true })
      await rm(cryptRootDir)
      await rm(bakPlainRootDir)
      crypt2plainIdMap.clear()
    }, 10000)

    test('commit E', async () => {
      await checkBranch({ ...plainCtx, commitHash: commitIdTable.E })
      await deleteBranch({ ...plainCtx, branchName: 'main', force: true })
      await createBranch({ ...plainCtx, newBranchName: 'E', commitHash: commitIdTable.E })
      await checkBranch({ ...plainCtx, commitHash: 'E' })

      // Test encrypt.
      crypt2plainIdMap = await gitCipher
        .encrypt({ crypt2plainIdMap })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
        currentBranch: 'E',
        branches: ['E'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
        ]),
      )
      expect(await getCommitInTopology({ ...cryptCtx, commitHash: 'E' })).toEqual([
        { id: repo1CryptCommitIdTable.A, parents: [] },
        { id: repo1CryptCommitIdTable.B, parents: [repo1CryptCommitIdTable.A] },
        { id: repo1CryptCommitIdTable.C, parents: [repo1CryptCommitIdTable.B] },
        { id: repo1CryptCommitIdTable.E, parents: [repo1CryptCommitIdTable.C] },
      ])
      expect(await getCommitWithMessageList({ ...cryptCtx, commitHashes: ['E'] })).toEqual([
        { id: repo1CryptCommitIdTable.E, message: repo1CryptCommitMessageTable.E },
        { id: repo1CryptCommitIdTable.C, message: repo1CryptCommitMessageTable.C },
        { id: repo1CryptCommitIdTable.B, message: repo1CryptCommitMessageTable.B },
        { id: repo1CryptCommitIdTable.A, message: repo1CryptCommitMessageTable.A },
      ])

      // Check catalog.
      await testCatalog(
        { message: commitTable.E.message, cryptParents: [repo1CryptCommitIdTable.C] },
        diffItemsTable.stepE,
        [itemTable.C2],
      )

      // Test Decrypt
      crypt2plainIdMap = await bakGitCipher
        .decrypt({ crypt2plainIdMap, gpgSign: false })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
        currentBranch: 'E',
        branches: ['E'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
        ]),
      )
      expect(await getCommitInTopology({ ...bakPlainCtx, commitHash: 'E' })).toEqual([
        { id: commitIdTable.A, parents: [] },
        { id: commitIdTable.B, parents: [commitIdTable.A] },
        { id: commitIdTable.C, parents: [commitIdTable.B] },
        { id: commitIdTable.E, parents: [commitIdTable.C] },
      ])
      expect(await getCommitWithMessageList({ ...bakPlainCtx, commitHashes: ['E'] })).toEqual([
        { id: commitIdTable.E, message: commitTable.E.message },
        { id: commitIdTable.C, message: commitTable.C.message },
        { id: commitIdTable.B, message: commitTable.B.message },
        { id: commitIdTable.A, message: commitTable.A.message },
      ])
    })

    test('commit I', async () => {
      await createBranch({ ...plainCtx, newBranchName: 'I', commitHash: commitIdTable.I })

      // Test encrypt.
      crypt2plainIdMap = await gitCipher
        .encrypt({ crypt2plainIdMap })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
        currentBranch: 'E',
        branches: ['E', 'I'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
          [repo1CryptCommitIdTable.G, commitIdTable.G],
          [repo1CryptCommitIdTable.I, commitIdTable.I],
        ]),
      )
      expect(await getCommitInTopology({ ...cryptCtx, commitHash: 'I' })).toEqual([
        { id: repo1CryptCommitIdTable.A, parents: [] },
        { id: repo1CryptCommitIdTable.B, parents: [repo1CryptCommitIdTable.A] },
        { id: repo1CryptCommitIdTable.G, parents: [repo1CryptCommitIdTable.B] },
        { id: repo1CryptCommitIdTable.I, parents: [repo1CryptCommitIdTable.G] },
      ])
      expect(await getCommitWithMessageList({ ...cryptCtx, commitHashes: ['I'] })).toEqual([
        { id: repo1CryptCommitIdTable.I, message: repo1CryptCommitMessageTable.I },
        { id: repo1CryptCommitIdTable.G, message: repo1CryptCommitMessageTable.G },
        { id: repo1CryptCommitIdTable.B, message: repo1CryptCommitMessageTable.B },
        { id: repo1CryptCommitIdTable.A, message: repo1CryptCommitMessageTable.A },
      ])

      // Check catalog.
      await checkBranch({ ...cryptCtx, commitHash: 'I' })
      await testCatalog(
        { message: commitTable.I.message, cryptParents: [repo1CryptCommitIdTable.G] },
        diffItemsTable.stepI,
        [itemTable.A2, itemTable.B, itemTable.C3, itemTable.D],
      )
      await checkBranch({ ...cryptCtx, commitHash: 'E' })

      // Test Decrypt
      crypt2plainIdMap = await bakGitCipher
        .decrypt({ crypt2plainIdMap, gpgSign: false })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
        currentBranch: 'E',
        branches: ['E', 'I'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
          [repo1CryptCommitIdTable.G, commitIdTable.G],
          [repo1CryptCommitIdTable.I, commitIdTable.I],
        ]),
      )
      expect(await getCommitInTopology({ ...bakPlainCtx, commitHash: 'I' })).toEqual([
        { id: commitIdTable.A, parents: [] },
        { id: commitIdTable.B, parents: [commitIdTable.A] },
        { id: commitIdTable.G, parents: [commitIdTable.B] },
        { id: commitIdTable.I, parents: [commitIdTable.G] },
      ])
      expect(await getCommitWithMessageList({ ...bakPlainCtx, commitHashes: ['I'] })).toEqual([
        { id: commitIdTable.I, message: commitTable.I.message },
        { id: commitIdTable.G, message: commitTable.G.message },
        { id: commitIdTable.B, message: commitTable.B.message },
        { id: commitIdTable.A, message: commitTable.A.message },
      ])
    })

    test('commit K', async () => {
      await createBranch({ ...plainCtx, newBranchName: 'K', commitHash: commitIdTable.K })
      await checkBranch({ ...plainCtx, commitHash: 'K' })

      // Test encrypt.
      crypt2plainIdMap = await gitCipher
        .encrypt({ crypt2plainIdMap })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...cryptCtx })).toEqual({
        currentBranch: 'K',
        branches: ['E', 'I', 'K'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.D, commitIdTable.D],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
          [repo1CryptCommitIdTable.F, commitIdTable.F],
          [repo1CryptCommitIdTable.G, commitIdTable.G],
          [repo1CryptCommitIdTable.H, commitIdTable.H],
          [repo1CryptCommitIdTable.I, commitIdTable.I],
          [repo1CryptCommitIdTable.J, commitIdTable.J],
          [repo1CryptCommitIdTable.K, commitIdTable.K],
        ]),
      )
      expect(await getCommitInTopology({ ...cryptCtx, commitHash: 'K' })).toEqual([
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
      expect(await getCommitWithMessageList({ ...cryptCtx, commitHashes: ['K'] })).toEqual([
        { id: repo1CryptCommitIdTable.K, message: repo1CryptCommitMessageTable.K },
        { id: repo1CryptCommitIdTable.J, message: repo1CryptCommitMessageTable.J },
        { id: repo1CryptCommitIdTable.I, message: repo1CryptCommitMessageTable.I },
        { id: repo1CryptCommitIdTable.H, message: repo1CryptCommitMessageTable.H },
        { id: repo1CryptCommitIdTable.G, message: repo1CryptCommitMessageTable.G },
        { id: repo1CryptCommitIdTable.F, message: repo1CryptCommitMessageTable.F },
        { id: repo1CryptCommitIdTable.E, message: repo1CryptCommitMessageTable.E },
        { id: repo1CryptCommitIdTable.D, message: repo1CryptCommitMessageTable.D },
        { id: repo1CryptCommitIdTable.C, message: repo1CryptCommitMessageTable.C },
        { id: repo1CryptCommitIdTable.B, message: repo1CryptCommitMessageTable.B },
        { id: repo1CryptCommitIdTable.A, message: repo1CryptCommitMessageTable.A },
      ])

      // Check catalog.
      await testCatalog(
        { message: commitTable.K.message, cryptParents: [repo1CryptCommitIdTable.J] },
        diffItemsTable.stepK,
        [itemTable.A, itemTable.B, itemTable.C3, itemTable.E],
      )

      // Test Decrypt
      crypt2plainIdMap = await bakGitCipher
        .decrypt({ crypt2plainIdMap, gpgSign: false })
        .then(md => md.crypt2plainIdMap)
      expect(await getAllLocalBranches({ ...bakPlainCtx })).toEqual({
        currentBranch: 'K',
        branches: ['E', 'I', 'K'],
      })
      expect(crypt2plainIdMap).toEqual(
        new Map([
          [repo1CryptCommitIdTable.A, commitIdTable.A],
          [repo1CryptCommitIdTable.B, commitIdTable.B],
          [repo1CryptCommitIdTable.C, commitIdTable.C],
          [repo1CryptCommitIdTable.D, commitIdTable.D],
          [repo1CryptCommitIdTable.E, commitIdTable.E],
          [repo1CryptCommitIdTable.F, commitIdTable.F],
          [repo1CryptCommitIdTable.G, commitIdTable.G],
          [repo1CryptCommitIdTable.H, commitIdTable.H],
          [repo1CryptCommitIdTable.I, commitIdTable.I],
          [repo1CryptCommitIdTable.J, commitIdTable.J],
          [repo1CryptCommitIdTable.K, commitIdTable.K],
        ]),
      )
      expect(await getCommitInTopology({ ...bakPlainCtx, commitHash: 'K' })).toEqual([
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
      expect(await getCommitWithMessageList({ ...bakPlainCtx, commitHashes: ['K'] })).toEqual([
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
    })

    test('log', () => {
      expect(logMock.getIndiscriminateAll()).toEqual([
        [
          "error [GitCipher] [safeExeca] failed to run git.  args: ['merge','06d25f06c6cd40756bf61624f1ee37bf014ec6d0','28fc4e74bf3bc436c21774dfc9947d60116d9716','-m','H -- Merge E and G <conflict> (b2,c3)']  options: {cwd:'<$WORKSPACE$>/packages/helper-git-cipher/__test__/fixtures/__fictitious__GitCipher/plain',env:{GIT_AUTHOR_DATE:'<$Date$> +0800',GIT_COMMITTER_DATE:'2023-01-27 15:00:08 +0800',GIT_AUTHOR_NAME:'guanghechen_h',GIT_COMMITTER_NAME:'guanghechen_h',GIT_AUTHOR_EMAIL:'exmaple_h@gmail.com',GIT_COMMITTER_EMAIL:'exmaple_h@gmail.com'},extendEnv:true,encoding:'utf8'}\n",
        ],
      ])
    })
  })

  describe('decryptFilesOnly', () => {
    const bakFilepathA: string = bakPlainPathResolver.resolve(fpA)
    const bakFilepathB: string = bakPlainPathResolver.resolve(fpB)
    const bakFilepathC: string = bakPlainPathResolver.resolve(fpC)
    const bakFilepathD: string = bakPlainPathResolver.resolve(fpD)
    const bakFilepathE: string = bakPlainPathResolver.resolve(fpE)

    let logMock: IReporterMock
    beforeAll(async () => {
      logMock = createReporterMock({ reporter })
      await emptyDir(workspaceDir)
      await buildRepo1({ repoDir: plainRootDir, reporter, execaOptions: {} })
      await gitCipher.encrypt({ crypt2plainIdMap: new Map() })
    })
    afterAll(async () => {
      await configKeeper.destroy()
      await rm(workspaceDir)
      logMock.restore()
    })
    beforeEach(async () => {
      await emptyDir(bakPlainRootDir)
    })

    const decryptAt = (cryptCommitId: string, filesOnly?: string[]): Promise<void> =>
      bakGitCipher.decryptFilesOnly({ cryptCommitId, filesOnly })
    const allBakFilepaths = (): string[] => collectAllFilesSync(bakPlainRootDir, () => true).sort()

    test('A', async () => {
      await decryptAt(repo1CryptCommitIdTable.A)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    })

    test('A -- with filesOnly', async () => {
      expect(allBakFilepaths()).toEqual([])

      await decryptAt(repo1CryptCommitIdTable.A, [fpA])
      expect(allBakFilepaths()).toEqual([bakFilepathA])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)

      await decryptAt(repo1CryptCommitIdTable.A, [fpA, fpB])
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    })

    test('B', async () => {
      await decryptAt(repo1CryptCommitIdTable.B)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC)
    })

    test('B -- with filesOnly', async () => {
      expect(allBakFilepaths()).toEqual([])

      await decryptAt(repo1CryptCommitIdTable.B, [fpA])
      expect(allBakFilepaths()).toEqual([bakFilepathA])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)

      await decryptAt(repo1CryptCommitIdTable.B, [fpB, fpC])
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC)
    })

    test('C', async () => {
      await decryptAt(repo1CryptCommitIdTable.C)
      expect(allBakFilepaths()).toEqual([bakFilepathB, bakFilepathC])
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC)
    })

    test('C -- with filesOnly', async () => {
      expect(allBakFilepaths()).toEqual([])

      await assertPromiseThrow(
        () => decryptAt(repo1CryptCommitIdTable.C, [fpA]),
        `Invariant failed: [decryptFilesOnly] cannot find file(s):`,
      )
      expect(allBakFilepaths()).toEqual([])

      await decryptAt(repo1CryptCommitIdTable.C, [fpB])
      expect(allBakFilepaths()).toEqual([bakFilepathB])
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)

      await assertPromiseThrow(
        () => decryptAt(repo1CryptCommitIdTable.C, [fpD]),
        `Invariant failed: [decryptFilesOnly] cannot find file(s):`,
      )
      expect(allBakFilepaths()).toEqual([bakFilepathB])
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    })

    test('D', async () => {
      await decryptAt(repo1CryptCommitIdTable.D)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC2)
    })

    test('E', async () => {
      await decryptAt(repo1CryptCommitIdTable.E)
      expect(allBakFilepaths()).toEqual([bakFilepathC])
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC2)
    })

    test('F', async () => {
      await decryptAt(repo1CryptCommitIdTable.F)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathC])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC2)
    })

    test('G', async () => {
      await decryptAt(repo1CryptCommitIdTable.G)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB2)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
    })

    test('H', async () => {
      await decryptAt(repo1CryptCommitIdTable.H)
      expect(allBakFilepaths()).toEqual([bakFilepathB, bakFilepathC])
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB2)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
    })

    test('I', async () => {
      await decryptAt(repo1CryptCommitIdTable.I)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC, bakFilepathD])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
      expect(await fs.readFile(bakFilepathD, encoding)).toEqual(contentD)
    })

    test('J', async () => {
      await decryptAt(repo1CryptCommitIdTable.J)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC, bakFilepathD])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
      expect(await fs.readFile(bakFilepathD, encoding)).toEqual(contentD)
    })

    test('K', async () => {
      await decryptAt(repo1CryptCommitIdTable.K)
      expect(allBakFilepaths()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC, bakFilepathE])
      expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
      expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
      expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
      expect(await fs.readFile(bakFilepathE, encoding)).toEqual(contentD)
    })
  })
})
