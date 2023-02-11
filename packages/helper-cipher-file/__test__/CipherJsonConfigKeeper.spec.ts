import type { ICipher } from '@guanghechen/helper-cipher'
import { AesGcmCipherFactory } from '@guanghechen/helper-cipher'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import { emptyDir, isFileSync, rm } from '@guanghechen/helper-fs'
import { assertPromiseThrow, locateFixtures } from 'jest.helper'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { CipherJsonConfigKeeper, PlainCipherJsonConfigKeeper } from '../src'

describe('CipherJsonConfigKeeper', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.CipherJsonConfigKeeper')
  const cipherFactory = new AesGcmCipherFactory()

  beforeAll(async () => {
    const password: Buffer = Buffer.from('guanghechen')
    cipherFactory.initFromPassword(password, {
      salt: 'ghc',
      iterations: 100000,
      digest: 'sha256',
    })
  })

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  interface IUser {
    name: string
    friends: Set<string>
    password: Buffer
  }

  interface IUserData {
    name: string
    friends: string[]
    password: string
  }

  const aliceData: IUserData = {
    name: 'Alice',
    friends: ['bob', 'tom'],
    password: '616c696365',
  }

  const bobData: IUserData = {
    name: 'Bob',
    friends: ['tom'],
    password: '626f62',
  }

  const alice: IUser = {
    name: 'Alice',
    friends: new Set(['bob', 'tom']),
    password: Buffer.from('alice', 'utf8'),
  }

  const bob: IUser = {
    name: 'Bob',
    friends: new Set(['tom']),
    password: Buffer.from('bob', 'utf8'),
  }

  test('customize', async () => {
    class MyCipherJsonConfigKeeper
      extends CipherJsonConfigKeeper<IUser, IUserData>
      implements IConfigKeeper<IUser>
    {
      public override readonly __version__ = '1.2.0'
      public override readonly __compatible_version__ = '^1.0.0'

      protected serialize(instance: IUser): IUserData {
        return {
          name: instance.name,
          friends: Array.from(instance.friends).sort(),
          password: instance.password.toString('hex'),
        }
      }
      protected deserialize(data: IUserData): IUser {
        return {
          name: data.name,
          friends: new Set<string>(data.friends),
          password: Buffer.from(data.password, 'hex'),
        }
      }
    }

    const cipher: ICipher = cipherFactory.cipher()
    const configFilepath: string = path.join(workspaceDir, 'customize/config.json')
    const keeper = new MyCipherJsonConfigKeeper({ filepath: configFilepath, cipher })

    expect(existsSync(configFilepath)).toEqual(false)
    await keeper.update(alice)
    expect(keeper.data).toEqual(alice)
    await keeper.save()
    expect(isFileSync(configFilepath)).toEqual(true)
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8'))).toEqual({
      __version__: keeper.__version__,
      __mac__: 'ad43c78227f5771c10b6ac10027eded3f409d867c8929a57879223503add722d',
      data: '45zFK4U+ozW07tX2VCP3YsGZKX1k91/Q5U5XV81FA+jk0MxF7Zi6erQ78P74F6G+mm9FFE6RxwYpleulLuP5kw==',
    })

    await keeper.update(bob)
    expect(keeper.data).toEqual(bob)
    await keeper.load()
    expect(keeper.data).toEqual(alice)

    await keeper.update(bob)
    expect(keeper.data).toEqual(bob)
    await keeper.save()
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8'))).toEqual({
      __version__: keeper.__version__,
      __mac__: 'c5d89f50ccfd3c5eafe67d9eb291fd18c7800cccf739c78ea0251748899a5b20',
      data: '45zFK4U+ozW07db9FWr3KJGWPnpl6hmZnFZ4GsIIPObqgtlZ882IJPJpq6+9UviqyH9dSw==',
    })

    const iv2: Buffer = Buffer.from('ghc'.repeat(20), 'utf8').slice(0, 12)
    const cipher2: ICipher = cipherFactory.cipher({ iv: iv2 })
    const keeper2 = new MyCipherJsonConfigKeeper({ filepath: configFilepath, cipher: cipher2 })
    await assertPromiseThrow(() => keeper2.load(), 'Unexpected token')

    await keeper2.update(alice)
    expect(keeper2.data).toEqual(alice)
    await keeper2.save()
    expect(isFileSync(configFilepath)).toEqual(true)
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8'))).toEqual({
      __version__: keeper.__version__,
      __mac__: 'ed83dba7fe6d1e3a036ed04b09d21e4a36416b6c230b6bd143cba4f347ceb363',
      data: 'ozeMUS8i6eP7LNIgGobxv0fk6EGsvy1x00hD805hYJQuy0QaIscPn9h8PWYkLT3cdG5LpCSxXvLyfw1qDkqKOg==',
    })
  })

  test('plain', async () => {
    const cipher: ICipher = cipherFactory.cipher()
    const configFilepath: string = path.join(workspaceDir, 'a/config.json')
    const keeper = new PlainCipherJsonConfigKeeper<IUserData>({ filepath: configFilepath, cipher })

    expect(existsSync(configFilepath)).toEqual(false)
    await keeper.update(aliceData)
    expect(keeper.data).toEqual(aliceData)
    await keeper.save()
    expect(isFileSync(configFilepath)).toEqual(true)
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8'))).toEqual({
      __version__: keeper.__version__,
      __mac__: 'ad43c78227f5771c10b6ac10027eded3f409d867c8929a57879223503add722d',
      data: '45zFK4U+ozW07tX2VCP3YsGZKX1k91/Q5U5XV81FA+jk0MxF7Zi6erQ78P74F6G+mm9FFE6RxwYpleulLuP5kw==',
    })

    await keeper.update(bobData)
    expect(keeper.data).toEqual(bobData)
    await keeper.load()
    expect(keeper.data).toEqual(aliceData)

    await keeper.update(bobData)
    expect(keeper.data).toEqual(bobData)
    await keeper.save()
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8'))).toEqual({
      __version__: keeper.__version__,
      __mac__: 'c5d89f50ccfd3c5eafe67d9eb291fd18c7800cccf739c78ea0251748899a5b20',
      data: '45zFK4U+ozW07db9FWr3KJGWPnpl6hmZnFZ4GsIIPObqgtlZ882IJPJpq6+9UviqyH9dSw==',
    })

    const cipher2: ICipher = cipherFactory.cipher({ iv: cipherFactory.createRandomIv() })
    const keeper2 = new PlainCipherJsonConfigKeeper({ filepath: configFilepath, cipher: cipher2 })
    await assertPromiseThrow(() => keeper2.load(), 'Unexpected token')
  })
})
