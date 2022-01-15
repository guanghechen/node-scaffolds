import path from 'path'
import { DEBUG, calcLoggerOptionsFromArgs, registerCommanderOptions } from '../src'

describe('command funcs', function () {
  test('generateOptions', function () {
    const logFilepath = path.resolve(__dirname, 'command.log')
    expect(
      calcLoggerOptionsFromArgs([
        '--log-level=debug',
        '--log-name=waw',
        '--log-mode=loose',
        '--log-flag=date',
        '--log-flag=no-inline',
        '--log-flag=no-title',
        '--log-flag',
        'no-colorful',
        '--log-filepath',
        logFilepath,
        '--log-encoding=utf-8',
      ]),
    ).toEqual({
      colorful: false,
      date: true,
      encoding: 'utf-8',
      filepath: logFilepath,
      inline: false,
      level: DEBUG,
      mode: 'loose',
      name: 'waw',
      title: false,
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
