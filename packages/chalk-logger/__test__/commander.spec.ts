import { Level, parseOptionsFromArgs, registerCommanderOptions } from '../src'

describe('command funcs', () => {
  describe('options', () => {
    test('default', () => {
      expect(parseOptionsFromArgs([])).toEqual({ flights: {} })
    })

    test('#1', () => {
      expect(
        parseOptionsFromArgs([
          '--log-level=debug',
          '--log-name=waw',
          '--log-mode=loose',
          '--log-flight=date',
          '--log-flight=no-inline',
          '--log-flight=no-title',
          '--log-flight',
          'no-colorful',
        ]),
      ).toEqual({
        name: 'waw',
        mode: 'loose',
        level: Level.DEBUG,
        flights: {
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
          '--log-flight=date,inline,no-colorful',
          'no-colorful',
        ]),
      ).toEqual({
        name: 'waw',
        mode: 'loose',
        level: Level.DEBUG,
        flights: {
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
      expect(remainOptions).toEqual({ flights: {} })
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
