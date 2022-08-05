import { Level, parseOptionsFromArgs, registerCommanderOptions } from '../src'

describe('command funcs', function () {
  test('generateOptions', function () {
    expect(
      parseOptionsFromArgs([
        '--log-level=debug',
        '--log-name=waw',
        '--log-mode=loose',
        '--log-flag=date',
        '--log-flag=no-inline',
        '--log-flag=no-title',
        '--log-flag',
        'no-colorful',
      ]),
    ).toEqual({
      name: 'waw',
      mode: 'loose',
      level: Level.DEBUG,
      flags: {
        date: true,
        title: false,
        inline: false,
        colorful: false,
      },
    })
  })

  test('registerCommanderOptions', function () {
    const infos: any[] = []

    const program = {
      option: (...args: any[]) => {
        infos.push(args)
        return program
      },
    }

    registerCommanderOptions(program)
    expect(infos).toMatchSnapshot('registered options')
  })
})
