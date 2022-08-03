import { collectAllFilesSync } from '@guanghechen/helper-file'
import fs from 'fs-extra'
import { desensitize, locateFixtures, unlinkSync } from 'jest.helper'
import path from 'path'
import { AESCipher, CipherCatalog } from '../src'

function expectEqual(catalog1: CipherCatalog, catalog2: CipherCatalog): void {
  expect(desensitize((catalog1 as any).items)).toEqual(desensitize((catalog2 as any).items))
}

describe('CipherCatalog', function () {
  const password = Buffer.from('@guanghechen/helper-cipher')
  const cipher = new AESCipher()
  cipher.initFromPassword(password)

  describe('preserve', function () {
    test('load / save', async function () {
      const catalog1 = new CipherCatalog({
        cipher,
        sourceRootDir: locateFixtures('catalog/source'),
        targetRootDir: locateFixtures('catalog/target/load-or-save'),
      })

      const catalog2 = new CipherCatalog({
        cipher,
        sourceRootDir: catalog1.sourceRootDir,
        targetRootDir: catalog1.targetRootDir,
      })

      const catalogIndexFilepath = locateFixtures('catalog/catalog.load-or-save.txt')

      catalog1.cleanup()
      const files = collectAllFilesSync(catalog1.sourceRootDir)
      for (const file of files) expect(catalog1.isModified(file)).toEqual(true)
      for (const file of files) await catalog1.register(file)

      catalog1.touch()
      for (const file of files) expect(catalog1.isModified(file)).toEqual(false)

      try {
        expect(fs.existsSync(catalogIndexFilepath)).toBe(false)
        await catalog1.save(catalogIndexFilepath)
        expect(fs.existsSync(catalogIndexFilepath)).toBe(true)

        await catalog2.loadFromFile(catalogIndexFilepath)
        expectEqual(catalog1, catalog2)
      } finally {
        unlinkSync(catalogIndexFilepath)
      }
    })

    test('checkIntegrity', async function () {
      const catalog = new CipherCatalog({
        cipher,
        sourceRootDir: locateFixtures('catalog/source'),
        targetRootDir: locateFixtures('catalog/target/checkIntegrity'),
      })

      catalog.cleanup()

      const tmpSourceFilepath = path.join(catalog.sourceRootDir, 'xx-' + Math.random())
      fs.writeFileSync(tmpSourceFilepath, 'ss')

      expect(collectAllFilesSync(catalog.targetRootDir).length).toEqual(0)
      const sourceFilepaths = collectAllFilesSync(catalog.sourceRootDir)
      for (const file of sourceFilepaths) {
        await catalog.register(file)
      }

      const targetFilepaths = collectAllFilesSync(catalog.targetRootDir)
      expect(targetFilepaths.length).toEqual(3)

      expect(() => catalog.checkIntegrity()).not.toThrow()
      fs.unlinkSync(targetFilepaths[0])
      expect(() => catalog.checkIntegrity()).toThrow('[INTEGRITY DAMAGE] cannot found')

      expect((catalog as any).lastCheckTime).toEqual(null)

      const prevDate = new Date().toISOString()
      catalog.touch()
      const nextDate = new Date().toISOString()
      expect(
        (catalog as any).lastCheckTime != null &&
          prevDate <= (catalog as any).lastCheckTime &&
          nextDate >= (catalog as any).lastCheckTime,
      ).toBe(true)

      for (const file of sourceFilepaths) await catalog.register(file)
      unlinkSync(tmpSourceFilepath)
      expect(collectAllFilesSync(catalog.targetRootDir).length).toEqual(3)
      catalog.cleanup()
      expect(collectAllFilesSync(catalog.targetRootDir).length).toEqual(2)
    })

    test('basic', async function () {
      const catalog1 = new CipherCatalog({
        cipher,
        sourceRootDir: locateFixtures('catalog/source'),
        targetRootDir: locateFixtures('catalog/target/basic'),
      })

      const catalog2 = new CipherCatalog({
        cipher,
        sourceRootDir: catalog1.sourceRootDir,
        targetRootDir: catalog1.targetRootDir,
      })

      const catalogIndexFilepath = locateFixtures('catalog/catalog.basic.txt')
      await catalog1.loadFromFile(catalogIndexFilepath)
      await catalog2.loadFromFile(catalogIndexFilepath)

      expect(catalog1).toEqual(catalog2)
      expect(catalog1.dump()).not.toEqual(catalog2.dump())
      expect(catalog1.dump()).not.toEqual(
        fs.readFileSync(catalogIndexFilepath, catalog1.sourceEncoding),
      )

      const files = collectAllFilesSync(catalog1.sourceRootDir)
      for (const file of files) {
        await catalog2.register(file)
      }

      expectEqual(catalog1, catalog2)
      expect((catalog1 as any).items).toMatchSnapshot()
    })
  })

  describe('big-file', function () {
    test('basic', async function () {
      const catalog = new CipherCatalog({
        cipher,
        sourceRootDir: locateFixtures('catalog/source'),
        targetRootDir: locateFixtures('catalog/target/big-file'),
        maxTargetFileSize: 1024 * 4, // 4KB
      })
      const sourceBakRootDir = locateFixtures('catalog/target/big-file-bak')

      catalog.cleanup()
      const sourceFiles = collectAllFilesSync(catalog.sourceRootDir).sort()
      for (const file of sourceFiles) {
        await catalog.register(file)
      }

      fs.emptyDirSync(sourceBakRootDir)
      await catalog.decryptAll(sourceBakRootDir)

      const bakSourceFiles = collectAllFilesSync(sourceBakRootDir).sort()
      expect(sourceFiles.length).toEqual(bakSourceFiles.length)
      for (let i = 0; i < sourceFiles.length; ++i) {
        expect(fs.readFileSync(sourceFiles[i])).toEqual(fs.readFileSync(bakSourceFiles[i]))
      }
    })
  })
})
