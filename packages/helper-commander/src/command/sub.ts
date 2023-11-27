import type { CommandOptions } from 'commander'
import type { ICommandConfigurationOptions } from '../types'
import type { Command } from './command'

export interface ISubCommandOptions extends ICommandConfigurationOptions {
  // nothing yet.
}

export interface ISubCommandProcessor<O extends ISubCommandOptions> {
  /**
   * Process the command arguments and options.
   * @param args      Command arguments.
   * @param options   Command options.
   */
  process(args: string[], options: O): Promise<void>
}

export interface ISubCommand<O extends ISubCommandOptions> extends ISubCommandProcessor<O> {
  /**
   * Sub command name.
   */
  readonly subCommandName: string

  /**
   * Sub command alias.
   */
  readonly aliases: string[]

  /**
   * Create an commander instance.
   * @param processor
   */
  command(processor: ISubCommandProcessor<O>): Command

  /**
   * Create a sub-command instance and execute it immediately.
   * @param args      Command arguments.
   * @param options   Command options.
   */
  execute(parentCommand: Command, rawArgs: string[]): Promise<void>

  /**
   * Create a sub-command instance and mount it to the parentCommand.
   * @param parentCommand
   * @param opts
   */
  mount(parentCommand: Command, opts: CommandOptions | undefined): void

  /**
   * Process the command options and rawArgs.
   * @param args      Command arguments.
   * @param options   Command options.
   */
  process(args: string[], options: O): Promise<void>

  /**
   * Resolve a processor for process the command.
   * @param args
   * @param options
   */
  resolveProcessor(args: string[], options: O): Promise<ISubCommandProcessor<O>>
}

export abstract class SubCommand<O extends ISubCommandOptions> implements ISubCommand<O> {
  public abstract subCommandName: string
  public abstract aliases: string[]

  public abstract command(processor: ISubCommandProcessor<O>): Command

  public mount(parentCommand: Command, opts: CommandOptions | undefined): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const processor: ISubCommandProcessor<O> = this
    const command: Command = this.command(processor)
    parentCommand.addCommand(command, opts)
  }

  public execute(parentCommand: Command, rawArgs: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const processor: ISubCommandProcessor<O> = {
        process: async (args: string[], options: O): Promise<void> => {
          try {
            await this.process(args, options)
            resolve()
          } catch (error) {
            reject(error)
          }
        },
      }

      const command = this.command(processor)
      parentCommand.addCommand(command)
      parentCommand.parse(rawArgs)
    })
  }

  public async process(args: string[], options: O): Promise<void> {
    const processor: ISubCommandProcessor<O> = await this.resolveProcessor(args, options)
    await processor.process(args, options)
  }

  public abstract resolveProcessor(args: string[], options: O): Promise<ISubCommandProcessor<O>>
}
