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
      __mac__: '0dd436d0a501788e6aad4a78747f35c3346c957d337cabb2cd5c235347dcccf8',
      data: 'e39cc52b853ea335b4eed5f65423f762c199297d64f75fd0e54e5757cd4503e8e4d0cc45ed98ba7ab43bf0fef817a1be9a6f45144e91c7062995eba52ee3f993',
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
      __mac__: '57dd53f575f67b77cc6f588062b21374ca6ee962c8c6c5e02777e035ce047728',
      data: 'e39cc52b853ea335b4edd6fd156af72891963e7a65ea19999c56781ac2083ce6ea82d959f3cd8824f269abafbd52f8aac87f5d4b',
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
      __mac__: '48a2d6c268c3a83cf2058a7bd54b1322d5d5118ad3cc424716dc9c2089334336',
      data: 'a3378c512f22e9e3fb2cd2201a86f1bf47e4e841acbf2d71d34843f34e6160942ecb441a22c70f9fd87c3d66242d3ddc746e4ba424b15ef2f27f0d6a0e4a8a3a',
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
      __mac__: '0dd436d0a501788e6aad4a78747f35c3346c957d337cabb2cd5c235347dcccf8',
      data: 'e39cc52b853ea335b4eed5f65423f762c199297d64f75fd0e54e5757cd4503e8e4d0cc45ed98ba7ab43bf0fef817a1be9a6f45144e91c7062995eba52ee3f993',
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
      __mac__: '57dd53f575f67b77cc6f588062b21374ca6ee962c8c6c5e02777e035ce047728',
      data: 'e39cc52b853ea335b4edd6fd156af72891963e7a65ea19999c56781ac2083ce6ea82d959f3cd8824f269abafbd52f8aac87f5d4b',
    })

    const cipher2: ICipher = cipherFactory.cipher({ iv: cipherFactory.createRandomIv() })
    const keeper2 = new PlainCipherJsonConfigKeeper({ filepath: configFilepath, cipher: cipher2 })
    await assertPromiseThrow(() => keeper2.load(), 'Unexpected token')
  })
})
