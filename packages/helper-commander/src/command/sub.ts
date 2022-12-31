import type { CommandOptions } from 'commander'
import type { ICommandConfigurationOptions } from '../types/configuration'
import type { Command } from './command'

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
export type ISubCommandMounter = (parentCommand: Command, opts?: CommandOptions) => void

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
  return (program: Command, opts?: CommandOptions): void => {
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
