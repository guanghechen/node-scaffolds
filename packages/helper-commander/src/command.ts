import { registerCommanderOptions } from '@guanghechen/chalk-logger'
import type { Option, OptionValues } from 'commander'
import commander from 'commander'
import type { ICommandConfigurationOptions } from './option'

/**
 * Callback for handling the command
 *
 * @param args    command arguments
 * @param options command options
 * @param extra   extra args (neither declared command arguments nor command options)
 */
export type ICommandActionCallback<T extends ICommandConfigurationOptions> = (
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
  public override action<T extends ICommandConfigurationOptions>(
    fn: ICommandActionCallback<T>,
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
  public override addCommand(command: Command, opts?: commander.CommandOptions): this {
    super.addCommand(command, opts)
    return this
  }
}

export { commander }

/**
 * Create top command
 * @param commandName
 * @param version
 */
export function createTopCommand(commandName: string, version: string): Command {
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
    .option('--parastic-config-path <parasticConfigFilepath>', 'parastic config filepath')
    .option('--parastic-config-entry <parasticConfigFilepath>', 'parastic config filepath')

  return program
}

// Process sub-command
export type ISubCommandProcessor<O extends ICommandConfigurationOptions, V = void> = (
  options: O,
) => V | Promise<V>

// Create sub-command
export type ISubCommandCreator<O extends ICommandConfigurationOptions, V = void> = (
  handle?: ISubCommandProcessor<O, V>,
  commandName?: string,
  aliases?: string[],
) => Command

// Mount sub-command
export type ISubCommandMounter = (parentCommand: Command, opts?: commander.CommandOptions) => void

// Execute sub-command
export type ISubCommandExecutor<V = void> = (parentCommand: Command, args: string[]) => Promise<V>

/**
 * Create sub-command mounter
 *
 * @param create  sub command creator
 * @param handle  sub command processor
 */
export function createSubCommandMounter<O extends ICommandConfigurationOptions, V = void>(
  create: ISubCommandCreator<O, V>,
  handle: ISubCommandProcessor<O, V>,
): ISubCommandMounter {
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
export function createSubCommandExecutor<O extends ICommandConfigurationOptions, V = void>(
  create: ISubCommandCreator<O, V>,
  handle: ISubCommandProcessor<O, V>,
  commandName?: string,
  aliases?: string[],
): ISubCommandExecutor<V> {
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

// Process main command.
export type IMainCommandProcessor<O extends ICommandConfigurationOptions, V = void> = (
  options: O,
) => V | Promise<V>

// Create main command
export type IMainCommandCreator<O extends ICommandConfigurationOptions, V = void> = (
  handle?: IMainCommandProcessor<O, V>,
) => Command

// Mount main command
export type IMainCommandMounter = (parentCommand: Command, opts?: commander.CommandOptions) => void

// Execute main command.
export type IMainCommandExecutor<V = void> = (args: string[]) => Promise<V>

/**
 * Create main command mounter
 *
 * @param create  main command creator
 * @param handle  main command processor
 */
export function createMainCommandMounter<O extends ICommandConfigurationOptions, V = void>(
  create: IMainCommandCreator<O, V>,
  handle: IMainCommandProcessor<O, V>,
): IMainCommandMounter {
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
export function createMainCommandExecutor<O extends ICommandConfigurationOptions, V = void>(
  create: IMainCommandCreator<O, V>,
  handle: IMainCommandProcessor<O, V>,
): IMainCommandExecutor<V> {
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
