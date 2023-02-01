import type { ICipher } from '@guanghechen/helper-cipher'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import { emptyDir, rm } from '@guanghechen/helper-fs'
import { locateFixtures } from 'jest.helper'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { JsonConfigKeeper } from '../src'

describe('JsonConfigKeeper', function () {
  const workspaceDir: string = locateFixtures('__fictitious__.JsonConfigKeeper')
  const cipherFactory = new AesCipherFactory()
  let cipher: ICipher

  interface IUser {
    name: string
    gender: 'male' | 'female'
    age: number
  }

  const alice: IUser = {
    name: 'Alice',
    gender: 'female',
    age: 33,
  }
  const bob: IUser = {
    name: 'Bob',
    gender: 'male',
    age: 23,
  }

  beforeAll(async () => {
    const secret = cipherFactory.createRandomSecret()
    cipher = cipherFactory.initFromSecret(secret)
  })

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('basic', async () => {
    const userConfigKeeper = new JsonConfigKeeper<IUser>({
      __version__: '2023-01-30',
      cipher,
      filepath: path.join(workspaceDir, 'user.txt'),
    })

    expect(existsSync(userConfigKeeper.filepath)).toEqual(false)
    expect(await userConfigKeeper.load()).toEqual(null)

    await userConfigKeeper.save(alice)
    expect(existsSync(userConfigKeeper.filepath)).toEqual(true)
    expect(await userConfigKeeper.load()).toEqual(alice)

    await userConfigKeeper.save(bob)
    expect(await userConfigKeeper.load()).toEqual(bob)

    await userConfigKeeper.remove()
    expect(existsSync(userConfigKeeper.filepath)).toEqual(false)
  })

  test('default data', async () => {
    const userConfigKeeper = new JsonConfigKeeper<IUser>({
      __version__: '2023-01-30',
      cipher,
      filepath: path.join(workspaceDir, 'user.txt'),
      getDefaultData: () => ({ ...alice }),
    })

    expect(existsSync(userConfigKeeper.filepath)).toEqual(false)
    expect(await userConfigKeeper.load()).toEqual(alice)

    await userConfigKeeper.save(bob)
    expect(existsSync(userConfigKeeper.filepath)).toEqual(true)
    expect(await userConfigKeeper.load()).toEqual(bob)

    await userConfigKeeper.remove()
    expect(existsSync(userConfigKeeper.filepath)).toEqual(false)
  })

  test('inconsistent version', async () => {
    const userConfigKeeper = new JsonConfigKeeper<IUser>({
      __version__: '2023-01-30',
      cipher,
      filepath: path.join(workspaceDir, 'user.txt'),
    })

    const userConfigKeeper2 = new JsonConfigKeeper<IUser>({
      __version__: '2023-01-31',
      cipher,
      filepath: path.join(workspaceDir, 'user.txt'),
    })

    await userConfigKeeper.save(alice)
    await expect(() => userConfigKeeper2.load()).rejects.toThrow(
      `config data's version is not matched`,
    )
  })

  test('custom serialize / deserialize', async () => {
    interface IUser2 extends IUser {
      contacts: Set<string>
    }

    interface IUser2Raw extends IUser {
      contacts: string[]
    }

    const userConfigKeeper = new JsonConfigKeeper<IUser2, IUser2Raw>({
      __version__: '2023-01-30',
      cipher,
      filepath: path.join(workspaceDir, 'user.txt'),
      serialize: user => ({ ...user, contacts: Array.from(user.contacts) }),
      deserialize: user => ({ ...user, contacts: new Set(user.contacts) }),
    })

    const alice2 = { ...alice, contacts: new Set(['bob', 'cat', 'tom']) }
    await userConfigKeeper.save(alice2)
    expect(await userConfigKeeper.load()).toEqual(alice2)
  })
})
