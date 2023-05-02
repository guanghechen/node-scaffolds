import type { CommandOptions } from 'commander'
import type { ICommandConfigurationOptions } from '../types'
import type { Command } from './command'

// Process sub-command
export type ISubCommandProcessor<O extends ICommandConfigurationOptions> = (
  options: O,
  args: string[],
) => void | Promise<void>

// Create sub-command
export type ISubCommandCreator<O extends ICommandConfigurationOptions> = (
  handle: ISubCommandProcessor<O>,
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
export function createSubCommandMounter<O extends ICommandConfigurationOptions>(
  create: ISubCommandCreator<O>,
  handle: ISubCommandProcessor<O>,
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
export function createSubCommandExecutor<O extends ICommandConfigurationOptions>(
  create: ISubCommandCreator<O>,
  handle: ISubCommandProcessor<O>,
  commandName?: string,
  aliases?: string[],
): ISubCommandExecutor {
  return (parentCommand: Command, rawArgs: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const wrappedHandler = async (options: O, args: string[]): Promise<void> => {
        try {
          await handle(options, args)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      const command = create(wrappedHandler, commandName, aliases)
      parentCommand.addCommand(command)
      parentCommand.parse(rawArgs)
    })
  }
}
