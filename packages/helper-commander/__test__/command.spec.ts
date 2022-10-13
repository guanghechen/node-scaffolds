import ChalkLogger from '@guanghechen/chalk-logger'
import { isNonBlankString } from '@guanghechen/helper-is'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { desensitize } from 'jest.helper'
import path from 'path'
import type { Command, ICommandConfigurationFlatOpts, ICommandConfigurationOptions } from '../src'
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
        '--log-flag=no-date',
        '--log-flag=no-color',
        '-f',
        '--no-silence',
      ]

      const logger = new ChalkLogger({ name: 'ghc', flags: { colorful: false, date: false } }, argv)
      const mock = createLoggerMock({ logger, desensitize })
      const result0 = await getCommand(argv, logger)
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
        '--log-flag=no-date',
        '--log-flag=no-color',
        '-f',
        '--no-silence',
      ]

      const logger = new ChalkLogger({ name: 'ghc', flags: { colorful: false, date: false } }, argv)
      const mock = createLoggerMock({ logger, desensitize })
      const result0 = await getCommand(argv, logger)
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
  logger: ChalkLogger,
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
          const resolvedOptions = resolveGlobalCommandOptions(
            '@guanghechen/helper-commander--demo',
            '',
            __defaultGlobalCommandOptions,
            path.resolve(),
            options,
            logger,
          )
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

function resolveGlobalCommandOptions<O extends object>(
  commandName: string,
  subCommandName: string | false,
  defaultOptions: O & IGlobalCommandOptions,
  workspaceDir: string,
  options: O & IGlobalCommandOptions,
  logger: ChalkLogger,
): O & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = O & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const resolvedDefaultOptions: R = resolveCommandConfigurationOptions<O & IGlobalCommandOptions>(
    logger,
    commandName,
    subCommandName,
    workspaceDir,
    defaultOptions,
    options,
  )

  // Resolve `encoding`.
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  // Resolve `input`.
  const _input: string | undefined = cover<string | undefined>(
    resolvedDefaultOptions.input,
    options.input,
    isNonBlankString,
  )
  const input: string | undefined = _input ? absoluteOfWorkspace(workspaceDir, _input) : undefined
  logger.debug('input:', input)

  // Resolve `output`.
  const _output: string | undefined = cover<string | undefined>(
    resolvedDefaultOptions.output,
    options.output,
    isNonBlankString,
  )
  const output: string | undefined = _output
    ? absoluteOfWorkspace(workspaceDir, _output)
    : undefined
  logger.debug('output:', output)

  // Resolve `force`.
  const force: boolean = cover<boolean>(
    resolvedDefaultOptions.force,
    convertToBoolean(options.force),
  )
  logger.debug('force:', force)

  // Resolve `silence`.
  const silence: boolean = cover<boolean>(
    resolvedDefaultOptions.silence,
    convertToBoolean(options.silence),
  )
  logger.debug('silence:', silence)

  return {
    ...resolvedDefaultOptions,
    encoding,
    input,
    output,
    force,
    silence,
  }
}
