import { calcMac } from '@guanghechen/helper-mac'
import { FileStorage } from '@guanghechen/helper-storage'
import type { PromiseOr } from '@guanghechen/utility-types'
import {
  assertPromiseThrow,
  emptyDir,
  isFileSync,
  locateFixtures,
  mkdirsIfNotExists,
  rm,
  writeFile,
} from 'jest.helper'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IConfigKeeper } from '../src'
import { JsonConfigKeeper, PlainJsonConfigKeeper } from '../src'

describe('JsonConfigKeeper', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.JsonConfigKeeper')

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  describe('customize', () => {
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

    class MyJsonConfigKeeper
      extends JsonConfigKeeper<IUser, IUserData>
      implements IConfigKeeper<IUser>
    {
      public override readonly __version__ = '1.1.0'
      public override readonly __compatible_version__ = '^1.0.0'

      protected serialize(instance: IUser): PromiseOr<IUserData> {
        return {
          name: instance.name,
          friends: Array.from(instance.friends).sort(),
          password: instance.password.toString('hex'),
        }
      }
      protected deserialize(data: IUserData): PromiseOr<IUser> {
        return {
          name: data.name,
          friends: new Set<string>(data.friends),
          password: Buffer.from(data.password, 'hex'),
        }
      }
    }

    const configFilepath: string = path.join(workspaceDir, 'MyJsonConfigKeeper/config.json')
    const storage = new FileStorage({ strict: true, filepath: configFilepath, encoding: 'utf8' })
    const keeper = new MyJsonConfigKeeper({ storage })

    testJsonConfigKeeper<IUser, IUserData>({
      className: 'MyJsonConfigKeeper',
      keeper,
      configFilepath,
      instance: { alice, bob },
      data: { alice: aliceData, bob: bobData },
    })
  })

  describe('PlainJsonConfigKeeper', () => {
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

    const configFilepath: string = path.join(workspaceDir, 'PlainJsonConfigKeeper/config.json')
    const storage = new FileStorage({ strict: true, filepath: configFilepath, encoding: 'utf8' })
    const keeper: IConfigKeeper<IUser> = new PlainJsonConfigKeeper({ storage })

    afterEach(async () => {
      await rm(configFilepath)
      await keeper.remove()
    })

    test('basic', () => {
      expect(keeper.__version__).toEqual('1.0.0')
      expect(keeper.__compatible_version__).toEqual('^1.0.0')
      expect(keeper.data).toEqual(undefined)
      expect(keeper.isCompatible('1.0.0')).toEqual(true)
      expect(keeper.isCompatible('1.0.3')).toEqual(true)
      expect(keeper.isCompatible('1.1.7-alpha.0')).toEqual(true)
      expect(keeper.isCompatible('0.0.1')).toEqual(false)
      expect(keeper.isCompatible('2.0.1')).toEqual(false)
      expect(keeper.isCompatible('2.1.7-alpha.0')).toEqual(false)
    })

    testJsonConfigKeeper<IUser, IUser>({
      className: 'PlainJsonConfigKeeper',
      keeper,
      configFilepath,
      instance: { alice, bob },
      data: { alice, bob },
    })
  })
})

function testJsonConfigKeeper<Instance, Data>(params: {
  className: string
  keeper: IConfigKeeper<Instance>
  configFilepath: string
  instance: { alice: Instance; bob: Instance }
  data: { alice: Data; bob: Data }
}): void {
  const { className, keeper, configFilepath, instance, data } = params
  expect(keeper.constructor.name).toEqual(className)

  afterEach(async () => {
    await rm(configFilepath)
    await keeper.remove()
  })

  const writeData = async (version: string, data: Data): Promise<void> => {
    const content: string = JSON.stringify(data)
    const mac: string = calcMac([Buffer.from(content)], 'sha256').toString('hex')
    await writeFile(
      configFilepath,
      JSON.stringify({ __version__: version, __mac__: mac, data: content }),
      'utf8',
    )
  }

  test('load', async () => {
    await assertPromiseThrow(() => keeper.load(), `Cannot find file`)
    mkdirsIfNotExists(configFilepath, true)
    await assertPromiseThrow(() => keeper.load(), `Not a file`)
    expect(keeper.data).toEqual(undefined)

    await rm(configFilepath)
    await writeFile(configFilepath, JSON.stringify({ data: data.alice }), 'utf8')
    await assertPromiseThrow(() => keeper.load(), `[${className}.load] Bad config, invalid fields`)
    expect(keeper.data).toEqual(undefined)

    await writeFile(configFilepath, JSON.stringify({ version: '1.0.0', data: data.alice }), 'utf8')
    await assertPromiseThrow(() => keeper.load(), `[${className}.load] Bad config, invalid fields`)
    expect(keeper.data).toEqual(undefined)

    await writeFile(configFilepath, 'null', 'utf8')
    await assertPromiseThrow(() => keeper.load(), `[${className}.load] Bad config, invalid fields`)
    expect(keeper.data).toEqual(undefined)

    await writeData('3.2.3', data.alice)
    await assertPromiseThrow(
      () => keeper.load(),
      `[${className}.load] Version not compatible. expect(${keeper.__compatible_version__}), received(3.2.3)`,
    )
    expect(keeper.data).toEqual(undefined)

    await writeData('1.0.0', data.alice)
    await keeper.load()
    expect(keeper.data).toEqual(instance.alice)

    await writeData('1.2.3', data.bob)
    expect(keeper.data).toEqual(instance.alice)
    await keeper.load()
    expect(keeper.data).toEqual(instance.bob)
  })

  test('update / save / remove', async () => {
    await assertPromiseThrow(() => keeper.save(), `[${className}.save] No valid data holding`)
    await keeper.update(instance.alice)
    expect(keeper.data).toEqual(instance.alice)

    await rm(path.dirname(configFilepath))
    await writeFile(path.dirname(configFilepath), 'Hello, world!', 'utf8')
    await assertPromiseThrow(() => keeper.save(), `Parent path is not a dir`)

    await rm(path.dirname(configFilepath))
    await keeper.save()
    expect(isFileSync(configFilepath)).toEqual(true)
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8')).data).toEqual(
      JSON.stringify(data.alice),
    )

    await keeper.update(instance.bob)
    expect(keeper.data).toEqual(instance.bob)
    expect(isFileSync(configFilepath)).toEqual(true)
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8')).data).toEqual(
      JSON.stringify(data.alice),
    )

    await keeper.save()
    expect(isFileSync(configFilepath)).toEqual(true)
    expect(JSON.parse(await fs.readFile(configFilepath, 'utf8')).data).toEqual(
      JSON.stringify(data.bob),
    )

    await keeper.remove()
    expect(isFileSync(configFilepath)).toEqual(false)
    expect(keeper.data).toEqual(undefined)

    mkdirsIfNotExists(configFilepath, true)
    await assertPromiseThrow(() => keeper.remove(), `Not a file`)
  })
}
