import { ChalkLogger } from '@guanghechen/chalk-logger'
import { isNonBlankString } from '@guanghechen/helper-is'
import { createReporterMock } from '@guanghechen/helper-jest'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { pathResolver } from '@guanghechen/path'
import { desensitize } from 'jest.helper'
import path from 'node:path'
import type {
  Command,
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
  IResolveCommandConfigurationOptionsParams,
} from '../src'
import { createTopCommand, resolveCommandConfigurationOptions } from '../src'

describe('command', () => {
  describe('no sub-command', () => {
    test('with arguments', async () => {
      const argv: string[] = [
        'node',
        'guanghechen',
        'source content waw waw waw',
        'this arg should be ignored',
        '--log-level=debug',
        '--log-flight=no-date',
        '--log-flight=no-colorful',
        '-f',
        '--no-silence',
      ]

      const reporter = new ChalkLogger(
        { name: 'ghc', flights: { colorful: false, date: false } },
        argv,
      )
      const mock = createReporterMock({ reporter, desensitize })
      const result0 = await getCommand(argv, reporter)
      expect(desensitize(result0.args)).toMatchSnapshot('args')
      expect(desensitize(result0.options)).toMatchSnapshot('options')
      expect(desensitize(result0.resolvedOptions)).toMatchSnapshot('resolvedOptions')
      expect(mock.getIndiscriminateAll()).toMatchSnapshot('logs')
      mock.restore()
    })

    test('without arguments', async () => {
      const argv: string[] = [
        'node',
        'guanghechen',
        '--log-level=debug',
        '--log-flight=no-date',
        '--log-flight=no-colorful',
        '-f',
        '--no-silence',
      ]

      const reporter = new ChalkLogger(
        { name: 'ghc', flights: { colorful: false, date: false } },
        argv,
      )
      const mock = createReporterMock({ reporter, desensitize })
      const result0 = await getCommand(argv, reporter)
      expect(desensitize(result0.args)).toMatchSnapshot('args')
      expect(desensitize(result0.options)).toMatchSnapshot('options')
      expect(desensitize(result0.resolvedOptions)).toMatchSnapshot('resolvedOptions')
      expect(mock.getIndiscriminateAll()).toMatchSnapshot('logs')
      mock.restore()
    })
  })
})

async function getCommand(
  argv: string[],
  reporter: ChalkLogger,
): Promise<{
  args: string[]
  options: IGlobalCommandOptions
  resolvedOptions: IGlobalCommandOptions & ICommandConfigurationFlatOpts
  program: Command
}> {
  type ICommandData = Awaited<ReturnType<typeof getCommand>>

  const __defaultGlobalCommandOptions: IGlobalCommandOptions = {
    encoding: 'utf8',
    input: undefined,
    output: undefined,
    force: false,
    silence: true,
  }

  const program = createTopCommand('guanghechen', '0.0.0')
  const result: ICommandData = await new Promise<ICommandData>((resolve, reject) => {
    program
      .argument('[source content')
      .option('-e, --encoding <encoding>', 'Encoding of content from stdin or file.')
      .option('-i, --input <filepath>', 'Copy the data from <filepath> to the system clipboard.')
      .option(
        '-o, --output <filepath>',
        'Write the data from the system clipboard into <filepath>.',
      )
      .option('-f, --force', 'Overwrite the <filepath> without confirmation.')
      .option('-S, --no-silence', 'print info level logs.')
      .action(function (args: string[], options: IGlobalCommandOptions): void {
        try {
          const resolvedOptions = resolveGlobalCommandOptions<IGlobalCommandOptions>({
            commandName: '@guanghechen/helper-commander--demo',
            defaultOptions: __defaultGlobalCommandOptions,
            reporter,
            options,
            subCommandName: '',
            workspace: path.resolve(),
          })
          resolve({ args, options, resolvedOptions, program })
        } catch (error) {
          reject(error)
        }
      })
      .parse(argv)
  })
  return result
}

interface IGlobalCommandOptions extends ICommandConfigurationOptions {
  encoding: BufferEncoding
  input?: string
  output?: string
  force: boolean
  silence: boolean
}

function resolveGlobalCommandOptions<O extends ICommandConfigurationOptions>(
  params: IResolveCommandConfigurationOptionsParams<O & IGlobalCommandOptions>,
): O & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = O & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const baseOptions: R = resolveCommandConfigurationOptions<O & IGlobalCommandOptions>(params)
  const { reporter, options } = params

  // Resolve `encoding`.
  const encoding: string = cover<string>(baseOptions.encoding, options.encoding, isNonBlankString)
  reporter.debug('encoding:', encoding)

  // Resolve `input`.
  const _input: string | undefined = cover<string | undefined>(
    baseOptions.input,
    options.input,
    isNonBlankString,
  )
  const input: string | undefined = _input
    ? pathResolver.safeResolve(baseOptions.workspace, _input)
    : undefined
  reporter.debug('input:', input)

  // Resolve `output`.
  const _output: string | undefined = cover<string | undefined>(
    baseOptions.output,
    options.output,
    isNonBlankString,
  )
  const output: string | undefined = _output
    ? pathResolver.safeResolve(baseOptions.workspace, _output)
    : undefined
  reporter.debug('output:', output)

  // Resolve `force`.
  const force: boolean = cover<boolean>(baseOptions.force, convertToBoolean(options.force))
  reporter.debug('force:', force)

  // Resolve `silence`.
  const silence: boolean = cover<boolean>(baseOptions.silence, convertToBoolean(options.silence))
  reporter.debug('silence:', silence)

  return {
    ...baseOptions,
    encoding,
    input,
    output,
    force,
    silence,
  }
}
