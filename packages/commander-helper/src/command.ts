import { registerCommanderOptions } from '@guanghechen/chalk-logger'
import type { Option, OptionValues } from 'commander'
import commander from 'commander'
import type { CommandConfigurationOptions } from './option'

/**
 * Callback for handling the command
 *
 * @param args    command arguments
 * @param options command options
 * @param extra   extra args (neither declared command arguments nor command options)
 */
export type CommandActionCallback<T extends CommandConfigurationOptions> = (
  args: string[],
  options: T,
  extra: string[],
) => void | Promise<void> | never

export class Command extends commander.Command {
  // add missing type declarations
  public options: Option[] | undefined
  protected _actionResults: unknown[] | undefined
  protected _storeOptionsAsProperties: boolean | undefined
  protected _optionValues: Record<string, unknown> | undefined
  protected _actionHandler: ((args: string[]) => void) | null | undefined
  protected _versionOptionName: string | undefined
  protected _version: string | undefined

  /**
   * Register callback `fn` for the command.
   *
   * Examples:
   *
   *      program
   *        .command('help')
   *        .description('display verbose help')
   *        .action(function() {
   *           // output help here
   *        });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   * @api public
   */
  public override action<T extends CommandConfigurationOptions>(
    fn: CommandActionCallback<T>,
  ): this {
    const self = this

    const listener = (args: string[]): void => {
      // eslint-disable-next-line max-len
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = self.args.length

      // const actionArgs: (string | Record<string, unknown> | string[])[] = [
      const actionArgs: [string[], T, string[]] = [
        // Command arguments
        args.slice(0, expectedArgsCount),

        // Command options
        self.opts() as T,

        // Extra arguments so available too.
        args.slice(expectedArgsCount),
      ]

      const actionResult = fn.apply(self, actionArgs)

      // Remember result in case it is async.
      // Assume parseAsync getting called on root.
      let rootCommand: Command = self
      while (rootCommand.parent != null) {
        rootCommand = rootCommand.parent as Command
      }
      if (rootCommand._actionResults != null) {
        rootCommand._actionResults.push(actionResult)
      }
    }

    self._actionHandler = listener
    return self
  }

  public override opts<T extends OptionValues>(): T {
    const self = this
    const nodes: Command[] = [self]
    for (let parent = self.parent; parent != null; parent = parent.parent) {
      nodes.push(parent as Command)
    }

    const options: Record<string, unknown> = {}
    for (let i = nodes.length - 1; i >= 0; --i) {
      const o = nodes[i]
      if (o._storeOptionsAsProperties) {
        for (const option of o.options!) {
          const key = option.attributeName()
          options[key] = key === o._versionOptionName ? o._version : o[key]
        }
      } else {
        for (const key of Object.getOwnPropertyNames(o._optionValues)) {
          options[key] = o._optionValues![key]
        }
      }
    }

    return options as unknown as T
  }

  // override
  public override addCommand(
    command: Command,
    opts?: commander.CommandOptions,
  ): this {
    super.addCommand(command, opts)
    return this
  }
}

export { commander }

/**
 * Create top command
 * @param commandName
 * @param version
 * @param logger
 */
export function createTopCommand(
  commandName: string,
  version: string,
): Command {
  const program = new Command()

  program.storeOptionsAsProperties(false).version(version).name(commandName)

  registerCommanderOptions(program)

  program
    .option(
      '-c, --config-path <configFilepath>',
      'config filepaths',
      (val, acc: string[]) => acc.concat(val),
      [],
    )
    .option(
      '--parastic-config-path <parasticConfigFilepath>',
      'parastic config filepath',
    )
    .option(
      '--parastic-config-entry <parasticConfigFilepath>',
      'parastic config filepath',
    )

  return program
}

/**
 * Process sub-command
 *
 * @param options
 * @returns {V|Promise<V>}
 */
export type SubCommandProcessor<
  O extends CommandConfigurationOptions,
  V = void,
> = (options: O) => V | Promise<V>

/**
 * Create sub-command
 */
export type SubCommandCreator<
  O extends CommandConfigurationOptions,
  V = void,
> = (
  handle?: SubCommandProcessor<O, V>,
  commandName?: string,
  aliases?: string[],
) => Command

/**
 * Mount sub-command
 *
 * @param {Command}   parentCommand
 * @param {commander.CommandOptions} opts
 * @returns {void}
 */
export type SubCommandMounter = (
  parentCommand: Command,
  opts?: commander.CommandOptions,
) => void

/**
 * Execute sub-command
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export type SubCommandExecutor<V = void> = (
  parentCommand: Command,
  args: string[],
) => Promise<V>

/**
 * Create sub-command mounter
 *
 * @param create  sub command creator
 * @param handle  sub command processor
 */
export function createSubCommandMounter<
  O extends CommandConfigurationOptions,
  V = void,
>(
  create: SubCommandCreator<O, V>,
  handle: SubCommandProcessor<O, V>,
): SubCommandMounter {
  return (program: Command, opts?: commander.CommandOptions): void => {
    const command = create(handle)
    program.addCommand(command, opts)
  }
}

/**
 * Create sub-command executor
 *
 * @param create        sub-command creator
 * @param handle        sub-command processor
 * @param commandName   sub-command name
 * @param aliases       sub-command aliases
 */
export function createSubCommandExecutor<
  O extends CommandConfigurationOptions,
  V = void,
>(
  create: SubCommandCreator<O, V>,
  handle: SubCommandProcessor<O, V>,
  commandName?: string,
  aliases?: string[],
): SubCommandExecutor<V> {
  return (parentCommand: Command, args: string[]): Promise<V> => {
    return new Promise(resolve => {
      const wrappedHandler = async (options: O): Promise<V> => {
        const result = await handle(options)
        resolve(result)
        return result
      }

      const command = create(wrappedHandler, commandName, aliases)
      parentCommand.addCommand(command)
      parentCommand.parse(args)
    })
  }
}

/**
 * Process main command
 */
export type MainCommandProcessor<
  O extends CommandConfigurationOptions,
  V = void,
> = (options: O) => V | Promise<V>

/**
 * Create main command
 */
export type MainCommandCreator<
  O extends CommandConfigurationOptions,
  V = void,
> = (handle?: MainCommandProcessor<O, V>) => Command

/**
 * Mount main command
 *
 * @param {Command}   parentCommand
 * @param {commander.CommandOptions} opts
 * @returns {void}
 */
export type MainCommandMounter = (
  parentCommand: Command,
  opts?: commander.CommandOptions,
) => void

/**
 * Execute main command
 *
 * @param {string[]}  args
 * @returns {Promise}
 */
export type MainCommandExecutor<V = void> = (args: string[]) => Promise<V>

/**
 * Create main command mounter
 *
 * @param create  main command creator
 * @param handle  main command processor
 */
export function createMainCommandMounter<
  O extends CommandConfigurationOptions,
  V = void,
>(
  create: MainCommandCreator<O, V>,
  handle: MainCommandProcessor<O, V>,
): MainCommandMounter {
  return (program: Command, opts?: commander.CommandOptions): void => {
    const command = create(handle)
    if (command.name().length <= 0) {
      command.name('__main__')
    }
    program.addCommand(command, { ...opts, isDefault: true })
  }
}

/**
 * Create main command executor
 *
 * @param create  main command creator
 * @param handle  main command processor
 */
export function createMainCommandExecutor<
  O extends CommandConfigurationOptions,
  V = void,
>(
  create: MainCommandCreator<O, V>,
  handle: MainCommandProcessor<O, V>,
): MainCommandExecutor<V> {
  return (args: string[]): Promise<V> => {
    return new Promise(resolve => {
      const wrappedHandler = async (options: O): Promise<V> => {
        const result = await handle(options)
        resolve(result)
        return result
      }

      const command = create(wrappedHandler)
      command.parse(args)
    })
  }
}
