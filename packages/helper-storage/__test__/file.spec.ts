import {
  assertPromiseNotThrow,
  assertPromiseThrow,
  emptyDir,
  locateFixtures,
  mkdirsIfNotExists,
  rm,
  writeFile,
} from 'jest.helper'
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { FileStorage } from '../src'

describe('FileStorage', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileStorage')

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  describe('no strict', () => {
    const configFilepath = path.join(workspaceDir, 'a/b/c/ghc.json')
    const content = 'Hello, world!'
    const encoding: BufferEncoding = 'utf8'
    const storage = new FileStorage({ strict: false, filepath: configFilepath, encoding })

    test('load-1', async () => {
      expect(existsSync(configFilepath)).toEqual(false)
      expect(await storage.load()).toEqual(undefined)
    })

    test('load-2', async () => {
      mkdirsIfNotExists(configFilepath, true)
      await assertPromiseThrow(() => storage.load(), 'Not a file')
    })

    test('load-3', async () => {
      await writeFile(configFilepath, content, encoding)
      expect(existsSync(configFilepath)).toEqual(true)
      expect(await storage.load()).toEqual(content)
    })

    test('save-1', async () => {
      await storage.save(content)
      expect(await readFile(configFilepath, encoding)).toEqual(content)
    })

    test('save-2', async () => {
      mkdirsIfNotExists(configFilepath, true)
      await assertPromiseThrow(() => storage.save(content), 'Not a file')
    })

    test('save-3', async () => {
      await storage.save(content)
      expect(await readFile(configFilepath, encoding)).toEqual(content)
    })

    test('save-4', async () => {
      const dir = path.dirname(configFilepath)
      await writeFile(dir, content, encoding)
      expect(existsSync(dir)).toEqual(true)
      expect(statSync(dir).isFile()).toEqual(true)
      await assertPromiseThrow(() => storage.save(content), 'Parent path is not a dir')
    })

    test('remove-1', async () => {
      await assertPromiseNotThrow(() => storage.remove())
      expect(existsSync(configFilepath)).toEqual(false)
    })

    test('remove-2', async () => {
      mkdirsIfNotExists(configFilepath, true)
      await assertPromiseThrow(() => storage.remove(), 'Not a file')
    })

    test('remove-3', async () => {
      await writeFile(configFilepath, content)
      expect(existsSync(configFilepath)).toEqual(true)

      await storage.remove()
      expect(existsSync(configFilepath)).toEqual(false)
    })
  })

  describe('strict', () => {
    const configFilepath = path.join(workspaceDir, 'a/b/c/ghc.json')
    const content = 'Hello, world!'
    const encoding: BufferEncoding = 'utf8'
    const storage = new FileStorage({ strict: true, filepath: configFilepath, encoding })

    test('load-1', async () => {
      expect(existsSync(configFilepath)).toEqual(false)
      await assertPromiseThrow(() => storage.load(), 'Cannot find file.')
    })

    test('load-2', async () => {
      mkdirsIfNotExists(configFilepath, true)
      await assertPromiseThrow(() => storage.load(), 'Not a file')
    })

    test('load-3', async () => {
      await writeFile(configFilepath, content, encoding)
      expect(existsSync(configFilepath)).toEqual(true)
      expect(await storage.load()).toEqual(content)
    })

    test('save-1', async () => {
      await storage.save(content)
      expect(await readFile(configFilepath, encoding)).toEqual(content)
    })

    test('save-2', async () => {
      mkdirsIfNotExists(configFilepath, true)
      await assertPromiseThrow(() => storage.save(content), 'Not a file')
    })

    test('save-3', async () => {
      await storage.save(content)
      expect(await readFile(configFilepath, encoding)).toEqual(content)
    })

    test('save-4', async () => {
      const dir = path.dirname(configFilepath)
      await writeFile(dir, content, encoding)
      expect(existsSync(dir)).toEqual(true)
      expect(statSync(dir).isFile()).toEqual(true)
      await assertPromiseThrow(() => storage.save(content), 'Parent path is not a dir')
    })

    test('remove-1', async () => {
      await assertPromiseNotThrow(() => storage.remove())
      expect(existsSync(configFilepath)).toEqual(false)
    })

    test('remove-2', async () => {
      mkdirsIfNotExists(configFilepath, true)
      await assertPromiseThrow(() => storage.remove(), 'Not a file')
    })

    test('remove-3', async () => {
      await writeFile(configFilepath, content)
      expect(existsSync(configFilepath)).toEqual(true)

      await storage.remove()
      expect(existsSync(configFilepath)).toEqual(false)
    })
  })
})
