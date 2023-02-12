import { Level, parseOptionsFromArgs, registerCommanderOptions } from '../src'

describe('command funcs', () => {
  describe('options', () => {
    test('default', () => {
      expect(parseOptionsFromArgs([])).toEqual({ flags: {} })
    })

    test('#1', () => {
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

    test('#2', () => {
      expect(
        parseOptionsFromArgs([
          '--log-level=debug',
          '--log-name=waw',
          '--log-mode=loose',
          '--log-flag=date,inline,no-colorful',
          'no-colorful',
        ]),
      ).toEqual({
        name: 'waw',
        mode: 'loose',
        level: Level.DEBUG,
        flags: {
          date: true,
          inline: true,
          colorful: false,
        },
      })
    })

    test('#3', () => {
      const { write, ...remainOptions } = parseOptionsFromArgs([
        '--log-filepath="a/waw.txt"',
        '--log-encoding',
        'gbk',
      ])
      expect(remainOptions).toEqual({ flags: {} })
      expect(write).toBeInstanceOf(Function)
    })
  })

  test('registerCommanderOptions', () => {
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
